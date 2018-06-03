const Model = require('objection').Model;

class Task extends Model {
    static get tableName() {
        return 'tasks';
    }

    //JSON
    static get jsonSchema() {
        return {
            type: 'object',
            require: ['task'],

            properties: {
                task_id: {type: "string"},
                user_id: {type: "string"},
                task: {type: "string", minLength: 1},
                state: {type: "string"}
            }
        }        
    }
}

module.exports = Task;