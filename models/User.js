const Model = require('objection').Model;

class User extends Model {
    static get tableName() {
        return 'users';
    }

    //JSON
    static get jsonSchema() {
        return {
            type: 'object',
            require: ['username', 'password', 'email'],

            properties: {
                user_id: {type: "string"},
                password: {type: "string", minLength: 3},
                username: {type: "string", minLength: 3},
                email: {type: "string", minLength: 3}
            }
        }        
    }
}

module.exports = User;