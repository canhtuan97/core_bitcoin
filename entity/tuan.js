const Users = require('../entity/User')

var task = Users.build({
          name: 'specify the project idea',
          pass: 2
        })

        task.name  // ==> 'specify the project idea'
        task.pass // ==> 2

        // Để lưu vào database chúng ta sử dụng function save
        task.save()