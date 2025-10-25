"use client";

import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { RefObject, useState } from "react";
import ImageSearchDrawer from "./ImageSearchDrawer";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

export const ChatInputBox = ({
  sendingMsg,
  inputRef,
  handleSend,
}: {
  sendingMsg: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  handleSend: ({ text, image }: { text?: string; image?: string }) => void;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || 0;
      const text = inputRef.current.value;
      const newText = text.slice(0, cursorPos) + emojiData.emoji + text.slice(cursorPos);
      inputRef.current.value = newText;

      // Move cursor after emoji
      inputRef.current.selectionStart = inputRef.current.selectionEnd =
        cursorPos + emojiData.emoji.length;

      inputRef.current.focus();
    }
  };

  return (
    <>
      <ImageSearchDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        onSelectImage={(imageUrl) => {
          handleSend({ image: imageUrl });
          setDrawerOpen(false); // close drawer after selection
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1,
          position: "sticky",
          bottom: 0,
          background: "#fff",
          py: 1,
          borderTop: "1px solid #ccc",
        }}
      >
        <IconButton color="primary" size="large" onClick={() => setDrawerOpen(true)}>
          <ImageSearchIcon />
        </IconButton>

        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          multiline
          inputRef={inputRef}
          maxRows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend({ text: inputRef.current?.value });
            }
          }}
        />

        <IconButton
          color="primary"
          size="large"
          onClick={() => setEmojiPickerOpen((prev) => !prev)}
        >
          <EmojiEmotionsIcon />
        </IconButton>

        <IconButton
          color="primary"
          onClick={() => handleSend({ text: inputRef.current?.value })}
          size="large"
          disabled={sendingMsg}
        >
          {sendingMsg ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>

        {emojiPickerOpen && (
          <Box sx={{ position: "fixed", bottom: "60px", right: "4vw", zIndex: 1000 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
      </Box>
    </>
  );
};
