SELECT repo_last_events.repository_url AS repository_url,
    repo_languages_watchers.repository_language AS repository_language,
    repo_languages_watchers.repository_watchers AS repository_watchers
FROM

-- Get language and number of stars as of the last event per repository
(SELECT repository_url, MAX(created_at) AS created_at
  FROM [publicdata:samples.github_timeline]
  WHERE PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00')
    AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2013-01-01 00:00:00')
  GROUP EACH BY repository_url) AS repo_last_events

JOIN EACH

(SELECT repository_url, repository_language, repository_watchers, created_at
  FROM [publicdata:samples.github_timeline]) AS repo_languages_watchers
ON repo_last_events.repository_url = repo_languages_watchers.repository_url
  AND repo_last_events.created_at = repo_languages_watchers.created_at

WHERE repository_watchers >= 1000;
