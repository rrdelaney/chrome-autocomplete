let scopes = Object.create(null)

scopes.github = text => `https://github.com/${text}`
scopes.github.description = text => `Github: <match>${text}</match>`
scopes.github.key = 'gh'

scopes.reddit = text => `https://reddit.com/${text}`
scopes.reddit.description = text => `Subreddit: <match>${text}</match>`
scopes.reddit.match = text => text.startsWith('r/') || text.startsWith('u/')
scopes.reddit.key = 'rd'

function getScope (text) {
  let scope = Object.keys(scopes).find(k => scopes[k].match && scopes[k].match(text))

  if (!scope && text.includes(':')) {
    scope = Object.keys(scopes).find(k => scopes[k].key === text.split(':')[0])
  }

  if (!scope) {
    scope = 'github'
  }

  return scopes[scope]
}

function normalizeText (text) {
  return text.includes(':') ? text.split(':').slice(1).join(':') : text
}

let MASTER_SCOPE = null

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  let scope = getScope(text)
  let newText = normalizeText(text)

  console.log(`Text: "${newText}"`)

  MASTER_SCOPE = scope
  chrome.omnibox.setDefaultSuggestion({
    description: scope.description(newText)
  })
})

chrome.omnibox.onInputEntered.addListener(text => {
  console.log('entered!')
  chrome.tabs.update({ url: MASTER_SCOPE(normalizeText(text)) })
})
