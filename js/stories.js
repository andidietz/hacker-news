"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const canFavorite= Boolean(currentUser)

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <button id="delete">Delete</button>
        ${canFavorite ? getFavoriteBtn(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getFavoriteBtn(story, user) {
  const isFavorited = user.isFavorited(story)
  const favoriteBtn = isFavorited ? 
    `<button class="Favorited" id="favorited-btn">Favorited</button>`:
    `<button class="not-favorite">Favorite</button>`
  return favoriteBtn
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt) {
  evt.preventDefault()
  const title = $("#create-title").val()
  const author = $("#create-author").val()
  const url = $("#create-url").val()
  const username = currentUser.username
  
  const $story = await storyList.addStory({title, author, url, username}, username)
  $allStoriesList.append($story)
}

$signupForm.on("submit", submitNewStory)

async function deleteStory(evt) {
  const $story = $(evt.target).closet("li");
  const storyId = $story.arr("id");

  await storyList.removeStory(storyId, currentUser);
  await putStoriesOnPage();
}

$allStoriesList.on("click", ".delete", deleteStory)

async function toggleFavorite(evt) {
  const $target = $(evt.target)
  const $storyFromList = $target.closet("li")
  const storyId = $storyFromList.attr("id")
  const story = storyList.stories.find(story => story.storyId === storyId)

  if ($target.hasClass("Favorited")) {
    await currentUser.removeFavorite(story)
    $target.toggleClass("not-favorite")
  } else {
    await currentUser.addFavorite(story)
    $target.toggleClass("favorited")
  }
}

$allStoriesList.on("click", ".favorited-btn", toggleFavorite)