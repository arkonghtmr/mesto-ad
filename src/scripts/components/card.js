export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const isCardLiked = (cardData, userId) => {
  return cardData.likes.some((user) => user._id === userId);
};

export const updateCardLike = (
  likeButton,
  likeCountElement,
  cardData,
  userId
) => {
  likeButton.classList.toggle(
    "card__like-button_is-active",
    isCardLiked(cardData, userId)
  );
  likeCountElement.textContent = cardData.likes.length;
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeCard, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLike(likeButton, likeCountElement, data, userId);

  if (onLikeCard) {
    likeButton.addEventListener("click", () =>
      onLikeCard(data, likeButton, likeCountElement)
    );
  }

  if (data.owner._id === userId && onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(data, cardElement)
    );
  } else {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
