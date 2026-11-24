# Low-risk PR

Marks the pull requests the team can approve quickly because they are small, low-risk, and written by someone who knows the repo.

## Language

**Low-risk PR**:
A pull request that meets every Low-risk criterion and therefore carries the `low-risk` label. It still needs a normal human approval, just a quick one.
_Avoid_: Fast-track PR, auto-approved PR, trivial PR

**Low-risk criteria**:
The conditions a PR must meet to be a Low-risk PR: the Change size is under 1,000 lines, it contains no Risky change, and its author is an Experienced author.

**Change size**:
Lines added plus lines deleted in a PR, not counting lockfiles and generated files.
_Avoid_: LOC, diff size

**Risky change**:
A change to a Flyway migration script or a Flowable BPMN process definition. Any one of them rules out Low-risk.
_Avoid_: DB change, sensitive change

**Experienced author**:
A PR author who already has 3 or more merged PRs in the same repository. Any member of the GitHub org can qualify, including people outside the team.
_Avoid_: Senior, trusted contributor, maintainer
