import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Container } from "@mui/material";
import { Save } from "@mui/icons-material";
import { useState } from "react";
import api from "../../../api/axios";

// Helper API call
const saveMarks = (reportCardId, marks) => api.post(`/report-cards/${reportCardId}/marks`, { marks });

export default function ReportCardEntryPage() {
    const [students, setStudents] = useState([
        // Mock data for prototype
        { id: 1, name: "Alice Johnson", roll: "101", marks: 0 },
        { id: 2, name: "Bob Smith", roll: "102", marks: 0 },
        { id: 3, name: "Charlie Davis", roll: "103", marks: 0 },
    ]);
    const [loading, setLoading] = useState(false);

    const handleMarkChange = (id, value) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, marks: Number(value) } : s));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            // Mock API call structure
            console.log("Saving marks:", students);
            // await saveMarks(reportCardId, students);
            alert("Marks saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save marks");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Enter Marks
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                >
                    Save All
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer sx={{ maxHeight: '70vh' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll No</TableCell>
                                <TableCell>Student Name</TableCell>
                                <TableCell align="right">Marks Obtained</TableCell>
                                <TableCell align="right">Max Marks</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={student.id}>
                                    <TableCell>{student.roll}</TableCell>
                                    <TableCell fontWeight="medium">{student.name}</TableCell>
                                    <TableCell align="right">
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={student.marks}
                                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                            sx={{ width: 100 }}
                                            inputProps={{ min: 0, max: 100, style: { textAlign: 'right' } }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">100</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}
