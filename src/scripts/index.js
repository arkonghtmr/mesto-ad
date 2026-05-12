/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  createCardElement,
  deleteCard,
  isCardLiked,
  updateCardLike,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  addCard,
  addCardLike,
  deleteCardFromServer,
  deleteCardLike,
  getInitialCards,
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
} from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

let currentUserId = null;

const renderLoading = (buttonElement, isLoading, loadingText) => {
  if (isLoading) {
    buttonElement.textContent = loadingText;
    return;
  }

  buttonElement.textContent = buttonElement.dataset.defaultText;
};

const renderUserInfo = ({ name, about, avatar }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleCardDelete = (cardData, cardElement) => {
  deleteCardFromServer(cardData._id)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch(console.error);
};

const handleCardLike = (cardData, likeButton, likeCountElement) => {
  const likeRequest = isCardLiked(cardData, currentUserId)
    ? deleteCardLike
    : addCardLike;

  likeRequest(cardData._id)
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      updateCardLike(likeButton, likeCountElement, updatedCard, currentUserId);
    })
    .catch(console.error);
};

const createCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeCard: handleCardLike,
    onDeleteCard: handleCardDelete,
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton =
    evt.submitter || profileForm.querySelector(".popup__button");

  renderLoading(submitButton, true, "Сохранение…");
  updateUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton =
    evt.submitter || avatarForm.querySelector(".popup__button");

  renderLoading(submitButton, true, "Сохранение…");
  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      renderUserInfo(userData);
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton =
    evt.submitter || cardForm.querySelector(".popup__button");

  renderLoading(submitButton, true, "Создание…");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

document.querySelectorAll(".popup__button").forEach((buttonElement) => {
  buttonElement.dataset.defaultText = buttonElement.textContent.trim();
});

enableValidation(validationSettings);

Promise.all([getUserInfo(), getInitialCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    renderUserInfo(userData);

    cards.forEach((cardData) => {
      placesWrap.append(createCard(cardData));
    });
  })
  .catch(console.error);
