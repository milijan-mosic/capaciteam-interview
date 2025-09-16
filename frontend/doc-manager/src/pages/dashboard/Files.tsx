import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { LogoutButton } from "@/components/LogoutButton";

// -------------------- Types --------------------
type FileItem = {
  id: string;
  name: string;
  latestVersion: number;
  // any other metadata from your API
};

type FileVersion = {
  version: number;
  downloadUrl: string;
  uploadedAt?: string;
};

// -------------------- Constants --------------------
const FAVORITES_KEY = "myfiles:favorites";

// -------------------- Axios instance --------------------
const api = axios.create({
  baseURL: "/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  },
});

// -------------------- Component --------------------
export const MyFiles = () => {
  const [tab, setTab] = useState<number>(0); // 0 = All files, 1 = Favorites
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);

  // Versions modal
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [versions, setVersions] = useState<FileVersion[]>([]);

  // Upload version modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFileId, setUploadFileId] = useState<string | null>(null);
  const [nextVersionForUpload, setNextVersionForUpload] = useState<
    number | null
  >(null);

  // Notifications
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Favorites (persisted locally)
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // persist favorites
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await api.get<FileItem[]>("/files/list");
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to fetch files" });
    } finally {
      setLoading(false);
    }
  }

  const visibleFiles = useMemo(() => {
    if (tab === 1) {
      return files.filter((f) => favorites[f.id]);
    }
    return files;
  }, [tab, files, favorites]);

  // -------------------- Actions --------------------
  function toggleFavorite(id: string) {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleDownloadLatest(id: string) {
    try {
      // If your backend provides a direct download URL, you can just window.open it.
      // Here we ask backend for the latest-download endpoint that returns a redirect or URL.
      const res = await api.get<{ url: string }>(
        `/files/${id}/download-latest`
      );
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to download latest version" });
    }
  }

  async function openVersionsModal(id: string) {
    setVersionsOpen(true);
    setCurrentFileId(id);
    setVersions([]);
    try {
      const res = await api.get<FileVersion[]>(`/files/${id}/versions/list`);
      setVersions(res.data.sort((a, b) => b.version - a.version));
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to load versions" });
    }
  }

  function closeVersionsModal() {
    setVersionsOpen(false);
    setCurrentFileId(null);
    setVersions([]);
  }

  async function openUploadVersionModal(id: string) {
    setUploadOpen(true);
    setUploadFileId(id);
    try {
      const res = await api.get<{ latestVersion: number }>(
        `/files/${id}/versions/get-latest`
      );
      setNextVersionForUpload(res.data.latestVersion + 1);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to determine next version" });
      setNextVersionForUpload(null);
    }
  }

  function closeUploadModal() {
    setUploadOpen(false);
    setUploadFileId(null);
    setNextVersionForUpload(null);
  }

  async function handleUploadNewVersion(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file || !uploadFileId) return;

    const form = new FormData();
    form.append("file", file);
    if (nextVersionForUpload !== null) {
      form.append("version", String(nextVersionForUpload));
    }

    try {
      await api.patch(`/files/${uploadFileId}/versions/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnack({ open: true, message: "Uploaded new version" });
      closeUploadModal();
      fetchFiles();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Upload failed" });
    }
  }

  async function handleUploadNewDocument(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnack({ open: true, message: "Uploaded document" });
      fetchFiles();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Upload failed" });
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, message: "Copied link to clipboard" });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Copy failed" });
    }
  }

  // -------------------- Columns --------------------
  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "name", headerName: "File Name", flex: 1 },
      { field: "latestVersion", headerName: "Version", width: 120 },
      {
        field: "actions",
        headerName: "Actions",
        width: 340,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const id = params.row.id as string;
          const fav = !!favorites[id];
          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="View Versions">
                <IconButton size="small" onClick={() => openVersionsModal(id)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Download Latest">
                <IconButton
                  size="small"
                  onClick={() => handleDownloadLatest(id)}
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Upload New Version">
                <IconButton
                  size="small"
                  onClick={() => openUploadVersionModal(id)}
                >
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={fav ? "Unfavorite" : "Favorite"}>
                <IconButton size="small" onClick={() => toggleFavorite(id)}>
                  {fav ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [favorites]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📁 My Files
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <label htmlFor="upload-document-input">
          <input
            id="upload-document-input"
            type="file"
            style={{ display: "none" }}
            onChange={handleUploadNewDocument}
          />
          <Button variant="contained" component="span">
            Upload Document
          </Button>
        </label>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="All files" />
          <Tab label="Favorites" />
        </Tabs>

        <LogoutButton />
      </Box>

      <div style={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={visibleFiles}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newSize: number) => setPageSize(newSize)}
          getRowId={(row) => row.id}
          pagination
        />
      </div>

      {/* Versions Modal */}
      <Dialog
        open={versionsOpen}
        onClose={closeVersionsModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Versions</DialogTitle>
        <DialogContent>
          {versions.length === 0 ? (
            <Typography>No versions found.</Typography>
          ) : (
            versions.map((v) => (
              <Box
                key={v.version}
                sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}
              >
                <Typography sx={{ minWidth: 80 }}>v{v.version}</Typography>
                <Typography sx={{ flex: 1, wordBreak: "break-all" }}>
                  {v.downloadUrl}
                </Typography>
                <Button
                  size="small"
                  onClick={() => window.open(v.downloadUrl, "_blank")}
                >
                  Download
                </Button>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(v.downloadUrl)}
                >
                  Copy link
                </Button>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVersionsModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload new version modal */}
      <Dialog
        open={uploadOpen}
        onClose={closeUploadModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload New Version</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Next version: {nextVersionForUpload ?? "—"}
          </Typography>

          <label htmlFor="upload-version-input">
            <input
              id="upload-version-input"
              type="file"
              style={{ display: "none" }}
              onChange={handleUploadNewVersion}
            />
            <Button variant="contained" component="span">
              Select file to upload as new version
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUploadModal}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, message: "" })}
        message={snack.message}
      />
    </Box>
  );
};
