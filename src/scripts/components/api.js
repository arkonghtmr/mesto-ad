const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "1b13f9d0-119d-46ba-b955-58a04024d68c",
    "Content-Type": "application/json",
  },
};

const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }

  return Promise.reject(`Ошибка: ${res.status}`);
};

const request = (endpoint, options = {}) => {
  return fetch(`${config.baseUrl}${endpoint}`, {
    headers: config.headers,
    ...options,
  }).then(checkResponse);
};

export const getUserInfo = () => {
  return request("/users/me");
};

export const getInitialCards = () => {
  return request("/cards");
};

export const updateUserInfo = ({ name, about }) => {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });
};

export const updateUserAvatar = (avatar) => {
  return request("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
};

export const addCard = ({ name, link }) => {
  return request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });
};

export const deleteCardFromServer = (cardId) => {
  return request(`/cards/${cardId}`, {
    method: "DELETE",
  });
};

export const addCardLike = (cardId) => {
  return request(`/cards/likes/${cardId}`, {
    method: "PUT",
  });
};

export const deleteCardLike = (cardId) => {
  return request(`/cards/likes/${cardId}`, {
    method: "DELETE",
  });
};
