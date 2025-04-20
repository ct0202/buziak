import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import userService from '../services/userService';

const Verification = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getVerificationUsers(page + 1, rowsPerPage);
      setUsers(response.data);
      setTotalUsers(response.total);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApprove = async (userId) => {
    try {
      await userService.approveVerification(userId);
      fetchUsers();
    } catch (err) {
      setError('Ошибка при одобрении верификации');
      console.error(err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await userService.rejectVerification(userId);
      fetchUsers();
    } catch (err) {
      setError('Ошибка при отклонении верификации');
      console.error(err);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const userDetails = await userService.getUserDetails(userId);
      setSelectedUser(userDetails);
      setOpenDialog(true);
    } catch (err) {
      setError('Ошибка при получении информации о пользователе');
      console.error(err);
    }
  };

  const getStatusColor = (verified) => {
    return verified ? 'success' : 'warning';
  };

  const getStatusText = (verified) => {
    return verified ? 'Верифицирован' : 'На рассмотрении';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Верификация
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Фото</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.verificationPhotoUrl ? (
                        <Tooltip
                          title={
                            <Box
                              component="img"
                              src={user.verificationPhotoUrl}
                              alt="Фото пользователя"
                              sx={{
                                maxWidth: 300,
                                maxHeight: 300,
                                objectFit: 'contain',
                              }}
                            />
                          }
                        >
                          <Box
                            component="img"
                            src={user.verificationPhotoUrl}
                            alt="Фото пользователя"
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography color="text.secondary">Нет фото</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(user.verified)}
                        color={getStatusColor(user.verified)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Просмотреть">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(user._id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {!user.verified && (
                        <>
                          <Tooltip title="Одобрить">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(user._id)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Отклонить">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(user._id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} из ${count}`
          }
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Информация о пользователе</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Основная информация
                  </Typography>
                  <Typography><strong>Имя:</strong> {selectedUser.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                  <Typography><strong>Телефон:</strong> {selectedUser.phone}</Typography>
                  <Typography><strong>Пол:</strong> {selectedUser.gender === 'male' ? 'Мужской' : 'Женский'}</Typography>
                  <Typography><strong>Дата регистрации:</strong> {formatDate(selectedUser.createdAt)}</Typography>
                  <Typography><strong>Статус:</strong> {getStatusText(selectedUser.verified)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Фото для верификации
                  </Typography>
                  {selectedUser.verificationPhotoUrl ? (
                    <Box
                      component="img"
                      src={selectedUser.verificationPhotoUrl}
                      alt="Фото для верификации"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      Фото не загружено
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verification; 