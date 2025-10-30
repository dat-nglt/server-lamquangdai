import { DataTypes } from 'sequelize';

const init = (sequelize) => {
  const Memberships = sequelize.define('Memberships', {
    member_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    level: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      defaultValue: 'bronze'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'memberships',
    timestamps: false
  });

  Memberships.associate = (db) => {
    Memberships.belongsTo(db.Users, { foreignKey: 'user_id' });
  };

  return Memberships;
};

export default init;