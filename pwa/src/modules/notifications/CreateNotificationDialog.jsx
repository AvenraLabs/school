import { useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Alert,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { useTeacherTimetable } from "../teacher-timetable/useTeacherTimetable";
import { createNotification } from "./notifications.api";

export default function CreateNotificationDialog({ open, onClose, onSuccess }) {
    const { timetable } = useTeacherTimetable();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        class_section: "", // Combined value "classId,sectionId"
    });
    const [sendWhatsapp, setSendWhatsapp] = useState(false);

    // Deduplicate classes from timetable
    const classOptions = useMemo(() => {
        if (!timetable) return [];
        const slots = Array.isArray(timetable)
            ? timetable
            : Object.values(timetable || {}).flat();
        const unique = new Map();
        slots.forEach((t) => {
            if (t.class_id && t.section_id) {
                const key = `${t.class_id},${t.section_id}`;
                if (!unique.has(key)) {
                    unique.set(key, {
                        class_id: t.class_id,
                        section_id: t.section_id,
                        label: `${t.class?.class_name || t.Class?.class_name || t.class?.name || t.Class?.name || t.class_id} - ${t.section?.name || t.Section?.name || t.section_id}`,
                    });
                }
            }
        });
        return Array.from(unique.values());
    }, [timetable]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.message) {
            setError("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                title: formData.title,
                message: formData.message,
                target_role: "student",
                send_whatsapp: sendWhatsapp,
            };

            if (formData.class_section) {
                const [classId, sectionId] = formData.class_section.split(",");
                payload.class_id = parseInt(classId);
                payload.section_id = parseInt(sectionId);
            }

            await createNotification(payload);
            window.dispatchEvent(new Event("notifications:refresh"));
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create announcement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <TextField
                        name="message"
                        label="Message"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="target-class-label" shrink>Recipient Class</InputLabel>
                        <Select
                            labelId="target-class-label"
                            name="class_section"
                            label="Recipient Class"
                            value={formData.class_section}
                            onChange={handleChange}
                            displayEmpty
                            renderValue={(selected) =>
                                selected
                                    ? classOptions.find((opt) => `${opt.class_id},${opt.section_id}` === selected)?.label
                                    : "All my classes"
                            }
                        >
                            <MenuItem value="">
                                <em>All my classes</em>
                            </MenuItem>
                            {classOptions.map((opt) => (
                                <MenuItem
                                    key={`${opt.class_id},${opt.section_id}`}
                                    value={`${opt.class_id},${opt.section_id}`}
                                >
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={sendWhatsapp}
                                onChange={(e) => setSendWhatsapp(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Send via WhatsApp"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
