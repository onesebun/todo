import axios from 'axios';

export const apiLogin = (username, password) => (
  axios.post(`/api/token/`, { username: username, password: password })
    .then(result => result)
    .catch(err => alert(err.message))
)

export const apiGetData = (token) => (
  axios.get('/todo/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(result => result)
    .catch(err => alert(err.message))
)

export const apiPostData = (task, token) => (
  axios.post(`/todo/`, { task: task }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(result => result)
    .catch(err => alert(err.message))
)

export const apiUpdateData = (o, token) => (
  axios.put(`/todo/${o.id}/`, o, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(result => result)
    .catch(err => alert(err.message))
)