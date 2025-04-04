import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  TextField,
  Avatar,
  Tooltip,
  Zoom,
  Fade,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import notesService from '../services/notes.service';
import userService from '../services/user.service';
import { useCurrentUser } from '../contexts/CurrentUser';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { v4 as uuidv4 } from 'uuid';

const Notes = ({ groupId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { currentUser } = useCurrentUser();

  const fetchUserProfilePicture = async (note) => {
    try {
      const user = await userService.getUserByEmail(note.createdBy.email);
      return {
        ...note,
        createdBy: {
          ...note.createdBy,
          picture: user?.profilePicture
        }
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return note;
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      console.log('Fetching notes for group:', groupId); // Debug log
      const fetchedNotes = await notesService.getNotesByGroupId(groupId);
      console.log('Fetched notes:', fetchedNotes); // Debug log
      const notesWithProfiles = await Promise.all(
        fetchedNotes.map(fetchUserProfilePicture)
      );
      setNotes(notesWithProfiles || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted with groupId:', groupId); // Debug log
    if (groupId) {
      fetchNotes();
    }
  }, [groupId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    console.log('Adding note for group:', groupId); // Debug log
    
    try {
      const noteData = {
        content: newNote.trim(),
        groupId: groupId,
        createdBy: {
          email: currentUser.email,
          name: currentUser.name,
          picture: currentUser.picture || null
        }
      };

      console.log('Note data being sent:', noteData); // Debug log

      const result = await notesService.addNote(noteData);
      console.log('Add note result:', result); // Debug log

      if (result.success) {
        setNewNote('');
        setIsAdding(false);
        await fetchNotes();
      } else {
        console.error('Failed to add note:', result.error);
      }
    } catch (error) {
      console.error('Error in handleAddNote:', error);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editText.trim()) return;

    try {
      const result = await notesService.updateNote(noteId, {
        content: editText
      });

      if (result.success) {
        setEditingNote(null);
        await fetchNotes();
      } else {
        console.error("Failed to update note:", result.message);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const result = await notesService.deleteNote(noteId);
      
      if (result.success) {
        await fetchNotes();
      } else {
        console.error("Failed to delete note:", result.message);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return 'Just now';
    }
    return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true });
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 450px)', // Decreased height
      display: 'flex', 
      flexDirection: 'column',
      gap: 2
    }}>
      {/* Add Note Button */}
      {!isAdding && (
        <Fade in={!isAdding}>
          <Box 
            onClick={() => setIsAdding(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 3,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(94, 114, 228, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 30px rgba(94, 114, 228, 0.3)',
              }
            }}
          >
            <AddIcon />
            <Typography fontWeight={600}>Add Note</Typography>
          </Box>
        </Fade>
      )}

      {/* Add Note Form */}
      {isAdding && (
        <Paper sx={{ 
          p: 2,
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 4px 20px rgba(94, 114, 228, 0.1)'
        }}>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setIsAdding(false)} color="inherit">
              <CloseIcon />
            </IconButton>
            <IconButton onClick={handleAddNote} color="primary">
              <SaveIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Notes List */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxHeight: 'calc(100vh - 520px)', // Adjusted max height
        px: 0.5,
        '&::-webkit-scrollbar': {
          width: 6,
          borderRadius: 10
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(94, 114, 228, 0.2)',
          borderRadius: 10
        }
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={40} sx={{ color: '#5e72e4' }} />
          </Box>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <Zoom in key={note.id}>
              <Paper sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 4px 20px rgba(94, 114, 228, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(94, 114, 228, 0.15)',
                }
              }}>
                {editingNote === note.id ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => setEditingNote(null)} color="inherit">
                        <CloseIcon />
                      </IconButton>
                      <IconButton onClick={() => handleUpdateNote(note.id)} color="primary">
                        <SaveIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ 
                      whiteSpace: 'pre-wrap',
                      mb: 2,
                      color: '#525f7f',
                      lineHeight: 1.6
                    }}>
                      {note.content}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={note.createdBy?.picture}
                          sx={{ width: 32, height: 32 }}
                        >
                          {note.createdBy?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#8898aa', display: 'block' }}>
                            {note.createdBy?.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#adb5bd' }}>
                            {formatDate(note.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => {
                            setEditingNote(note.id);
                            setEditText(note.content);
                          }}
                          size="small"
                          sx={{ color: '#5e72e4' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteNote(note.id)}
                          size="small"
                          sx={{ color: '#f5365c' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </Zoom>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            color: '#8898aa',
            p: 4
          }}>
            <Typography variant="body1">No notes yet</Typography>
            <Typography variant="caption">Click the button above to add one</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Notes;
