"""empty message

Revision ID: 738f445eee6b
Revises: 
Create Date: 2024-10-12 01:11:00.803989

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '738f445eee6b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('exercises',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password', sa.String(length=80), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_admin', sa.Boolean(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('age', sa.Integer(), nullable=False),
    sa.Column('weight', sa.Float(), nullable=False),
    sa.Column('height', sa.Float(), nullable=False),
    sa.Column('target_weight', sa.Float(), nullable=False),
    sa.Column('registration_date', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('training_plans',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('duration_minutes', sa.Time(), nullable=False),
    sa.Column('burn_calories', sa.Integer(), nullable=False),
    sa.Column('level', sa.Enum('begginer', 'intermediate', 'advanced', name='level'), nullable=False),
    sa.Column('registration_date', sa.DateTime(), nullable=False),
    sa.Column('finalization_date', sa.DateTime(), nullable=False),
    sa.Column('quantity_session', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sessions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('duration_minutes', sa.Time(), nullable=False),
    sa.Column('training_plan_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['training_plan_id'], ['training_plans.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('training_exercises',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('duration_minutes', sa.Time(), nullable=False),
    sa.Column('repetitions', sa.Integer(), nullable=False),
    sa.Column('resting_time', sa.Time(), nullable=False),
    sa.Column('series', sa.Integer(), nullable=False),
    sa.Column('training_plan_id', sa.Integer(), nullable=False),
    sa.Column('exercise_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ),
    sa.ForeignKeyConstraint(['training_plan_id'], ['training_plans.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('session_exercises',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('duration_minutes', sa.Time(), nullable=False),
    sa.Column('series', sa.Integer(), nullable=False),
    sa.Column('repetitions', sa.Integer(), nullable=False),
    sa.Column('resting_time', sa.Time(), nullable=False),
    sa.Column('is_done', sa.Boolean(), nullable=False),
    sa.Column('session_id', sa.Integer(), nullable=False),
    sa.Column('exercise_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('session_exercises')
    op.drop_table('training_exercises')
    op.drop_table('sessions')
    op.drop_table('training_plans')
    op.drop_table('users')
    op.drop_table('exercises')
    # ### end Alembic commands ###
