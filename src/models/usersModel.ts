'use strict';
module.exports = function (sequelize : any,DataTypes:any) {
    const user = sequelize.define('users',{
        user_id:{
            type: DataTypes.STRING(60),
            primaryKey: true,
            unique: true,
        },
        name: DataTypes.STRING(60),
        email: DataTypes.STRING(30),
        password: DataTypes.STRING(60),
        access_token: DataTypes.STRING(200),
        refresh_token: DataTypes.STRING(200),
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    },{
        tableName: 'users',
        timestamps: false,
        underscored: true,
    });
    return user;
}