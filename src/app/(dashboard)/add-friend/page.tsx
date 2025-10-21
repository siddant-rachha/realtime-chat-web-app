/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAuthContext } from "@/store/Auth/useAuthContext";

export default function AddFriendPage() {
  const {
    selectors: { firebaseUser, user },
  } = useAuthContext();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{
    uid: string;
    displayName: string;
    username: string;
  } | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/getFriends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await firebaseUser?.getIdToken() }),
      });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const res = await fetch("/api/searchUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: search }),
      });
      const data = await res.json();
      setResult(data.user || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendUid: string) => {
    if (!user) return;
    try {
      await fetch("/api/addFriend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await firebaseUser?.getIdToken(), friendUid }),
      });
      fetchFriends();
      setResult(null);
      setSearch("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendUid: string) => {
    if (!user) return;
    try {
      await fetch("/api/removeFriend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await firebaseUser?.getIdToken(), friendUid }),
      });
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          fullWidth
          label="Search by username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button sx={{ ml: 2 }} variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      {result && (
        <Box sx={{ mb: 3 }}>
          <Typography>
            {result.displayName} (@{result.username})
          </Typography>
          <Button variant="outlined" onClick={() => handleAddFriend(result.uid)}>
            Add Friend
          </Button>
        </Box>
      )}

      <Typography variant="h6" sx={{ mt: 3 }}>
        Your Friends
      </Typography>
      <List>
        {friends.map((friend: any) => (
          <ListItem
            key={friend.uid}
            secondaryAction={
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveFriend(friend.uid)}
              >
                Remove
              </Button>
            }
          >
            <ListItemText primary={friend.displayName} secondary={`@${friend.username}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
