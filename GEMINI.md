# Project Rules & Guidelines

## Git & Version Control

- **STRICT LOCAL GIT ONLY**: Ни при каких обстоятельствах не отправлять изменения в удалённый репозиторий (`remote`).
- **Запрещено**: выполнение `git push`, публикация веток, тегов или коммитов на remote.
- Все коммиты, ветки, слияния и история ведутся **исключительно локально**.
- В репозитории настроены защитные механизмы:
  - `remote.origin.pushurl = DISABLED`
  - Git-хук `.git/hooks/pre-push`, блокирующий любую команду `git push`.
