CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE columns (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_columns_user_id ON columns(user_id);

CREATE TABLE cards (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id  UUID        NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    due_date   DATE,
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cards_column_id ON cards(column_id);

CREATE TABLE card_tags (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id    UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    color      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_card_tags_card_id ON card_tags(card_id);
