export enum QuestStatus {
    NOT_STARTED = 'not_started',
    STARTING = 'starting',
    IN_PROGRESS = 'in_progress',
    STUCK = 'stuck',
    REVIEW_NEEDED = 'review_needed',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned'
}

export enum StepStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    NEEDS_HELP = 'needs_help',
    FAILED = 'failed',
    COMPLETED = 'completed',
    SKIPPED = 'skipped'
}

export enum ModuleTheme {
    GIT_BASICS = 'git-basics',
    BRANCHING = 'branching',
    REMOTE = 'remote',
    ADVANCED = 'advanced',
    GENERAL = 'general'
}

export enum WorldDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export enum WorldStatus {
    DRAFT = 'draft',
    REVIEW = 'review',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}