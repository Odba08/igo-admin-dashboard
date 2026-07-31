import { useState } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  
  // Dialog States
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setEventTitle("");
    setOpenAdd(true);
  };

  const handleSaveEvent = () => {
    if (eventTitle.trim() && selectedDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      calendarApi.addEvent({
        id: `${selectedDate.dateStr}-${eventTitle}`,
        title: eventTitle,
        start: selectedDate.startStr,
        end: selectedDate.endStr,
        allDay: selectedDate.allDay,
      });
      
      setOpenAdd(false);
      setEventTitle("");
      setSelectedDate(null);
    }
  };

  const handleEventClick = (selected) => {
    setSelectedEvent(selected);
    setOpenDelete(true);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      selectedEvent.event.remove();
      setOpenDelete(false);
      setSelectedEvent(null);
    }
  };

  return (
    <Box m="20px">
      <Header title="CALENDARIO" subtitle="Agenda interactiva del Panel Admin" />

      <Box display="flex" justifyContent="space-between" mt="20px">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
          border={`1px solid ${colors.grey[700]}`}
          maxHeight="75vh"
          sx={{ overflowY: "auto" }}
        >
          <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
            Eventos Guardados ({currentEvents.length})
          </Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: "#1e1e1e",
                  borderLeft: `4px solid ${colors.greenAccent[500]}`,
                  margin: "10px 0",
                  borderRadius: "4px",
                }}
              >
                <ListItemText
                  primary={
                    <Typography color={colors.grey[100]} fontWeight="bold">
                      {event.title}
                    </Typography>
                  }
                  secondary={
                    <Typography color={colors.grey[300]} variant="body2">
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={[
              {
                id: "12315",
                title: "Reunión de Admin",
                date: "2026-07-25",
              },
              {
                id: "5123",
                title: "Mantenimiento Servidor",
                date: "2026-07-28",
              },
            ]}
          />
        </Box>
      </Box>

      {/* DIALOG ADD EVENT */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], fontWeight: "bold" }}>
          Añadir Nuevo Evento
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <TextField
            autoFocus
            margin="dense"
            label="Título del Evento"
            type="text"
            fullWidth
            variant="outlined"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            sx={{
              mt: "10px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.grey[700] },
                "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: "15px 24px" }}>
          <Button onClick={() => setOpenAdd(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained" 
            sx={{ backgroundColor: colors.greenAccent[500], color: "#000", fontWeight: "bold" }}
          >
            Añadir
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DELETE EVENT */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], fontWeight: "bold" }}>
          Eliminar Evento
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Typography color={colors.grey[300]}>
            ¿Estás seguro de que deseas eliminar el evento "{selectedEvent?.event.title}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: "15px 24px" }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
            variant="contained" 
            color="error"
            sx={{ fontWeight: "bold" }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
