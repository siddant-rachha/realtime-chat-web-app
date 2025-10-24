/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Button,
  SwipeableDrawer,
  Typography,
  TextField,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";

export default function ImageSearchDrawer({
  open,
  onClose,
  onOpen,
  onSelectImage,
}: {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSelectImage: (imageUrl: string) => void;
}) {
  const [gifQuery, setGifQuery] = useState("");
  const [imgQuery, setImgQuery] = useState("");
  const [tab, setTab] = useState<"images" | "gifs">("gifs"); // default GIF tab
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchTab?: "images" | "gifs", searchText?: string) => {
    const currentTab = searchTab || tab;
    const query = searchText ?? (currentTab === "gifs" ? gifQuery : imgQuery);

    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    const searchTerm = currentTab === "gifs" ? `${query} ext:gif` : query;

    try {
      const res = await fetch("/api/braveImageSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, type: currentTab }),
      });
      const data = await res.json();
      setResults(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: "images" | "gifs") => {
    setTab(newValue);
    const newQuery = newValue === "gifs" ? gifQuery : imgQuery;
    if (newQuery.trim()) handleSearch(newValue, newQuery);
  };

  const handleClear = () => {
    setResults([]);
    if (tab === "gifs") setGifQuery("");
    else setImgQuery("");
  };

  const currentQuery = tab === "gifs" ? gifQuery : imgQuery;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      PaperProps={{ sx: { height: "80%", borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Image Search
        </Typography>

        {/* Search bar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search for images..."
            value={currentQuery}
            onChange={(e) =>
              tab === "gifs" ? setGifQuery(e.target.value) : setImgQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => handleSearch()}
            disabled={loading || !currentQuery.trim()}
            sx={{ mr: 1 }}
          >
            {loading ? "Loading..." : "Search"}
          </Button>
          <Button variant="outlined" onClick={handleClear}>
            Clear
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="GIFs" value="gifs" />
          {/* temporary disabled feature, will enable when ready */}
          {/* <Tab label="Images" value="images" />  */}
        </Tabs>

        {/* Results */}
        <Grid container spacing={1}>
          {results.map((img: any, idx: number) => {
            const imgSrc = img.properties?.url || img.url;
            return (
              <Grid key={idx}>
                <Box
                  component="img"
                  src={imgSrc}
                  alt=""
                  sx={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => onSelectImage(imgSrc)} // send on click
                />
              </Grid>
            );
          })}
        </Grid>

        {!loading && results.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            No results yet. Try searching something!
          </Typography>
        )}
      </Box>
    </SwipeableDrawer>
  );
}
