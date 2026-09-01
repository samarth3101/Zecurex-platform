"""Add auth and security models

Revision ID: 6a8f12d45e90
Revises: 52cb01d81346
Create Date: 2026-09-01 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6a8f12d45e90'
down_revision: Union[str, Sequence[str], None] = '52cb01d81346'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='operator'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. sessions table
    op.create_table(
        'sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('session_token_hash', sa.String(length=64), nullable=False),
        sa.Column('device_name', sa.String(length=100), nullable=False, server_default='Unknown Device'),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=512), nullable=True),
        sa.Column('is_trusted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sessions_session_token_hash'), 'sessions', ['session_token_hash'], unique=True)
    op.create_index(op.f('ix_sessions_user_id'), 'sessions', ['user_id'], unique=False)

    # 3. trusted_devices table
    op.create_table(
        'trusted_devices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('device_hash', sa.String(length=64), nullable=False),
        sa.Column('device_name', sa.String(length=100), nullable=False, server_default='Recognized Device'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trusted_devices_device_hash'), 'trusted_devices', ['device_hash'], unique=False)
    op.create_index(op.f('ix_trusted_devices_user_id'), 'trusted_devices', ['user_id'], unique=False)

    # 4. verification_codes table
    op.create_table(
        'verification_codes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('purpose', sa.String(length=50), nullable=False),
        sa.Column('code_hash', sa.String(length=64), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_attempts', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('consumed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_verification_codes_code_hash'), 'verification_codes', ['code_hash'], unique=False)
    op.create_index(op.f('ix_verification_codes_email'), 'verification_codes', ['email'], unique=False)

    # 5. recovery_codes table
    op.create_table(
        'recovery_codes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('code_hash', sa.String(length=64), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recovery_codes_code_hash'), 'recovery_codes', ['code_hash'], unique=False)
    op.create_index(op.f('ix_recovery_codes_user_id'), 'recovery_codes', ['user_id'], unique=False)

    # 6. security_events table
    op.create_table(
        'security_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('device_info', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_security_events_email'), 'security_events', ['email'], unique=False)
    op.create_index(op.f('ix_security_events_event_type'), 'security_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_security_events_user_id'), 'security_events', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_table('security_events')
    op.drop_table('recovery_codes')
    op.drop_table('verification_codes')
    op.drop_table('trusted_devices')
    op.drop_table('sessions')
    op.drop_table('users')
