//jQuery
$(document).ready(function () {
    const socket = io.connect("http://localhost:3000/");

    $('form').submit(() => {
        const name = $('#newTask').val();
        socket.emit("tasks", name);
        $('#newTask').val('');
        return false;
    });

    //bliver kaldt, når der addes task
    //data der sendes 
    socket.on("tasks", tasks => {
        console.log("tasks", tasks);
        const tasksElement = document.getElementById("tasks"); //<ul></ul>

        for (const task of tasks) {
            const taskElement = document.createElement("li");
            taskElement.dataset.taskId = task.id;
            taskElement.innerText = `${task.name}`; // <li>Besked</li>
            taskElement.addEventListener('click', function () {
                $(this).toggleClass('is-done');
                socket.emit('toggleTask', this.dataset.taskId);
            });

            if (task.done) {
                taskElement.classList.add('is-done');
            }

            tasksElement.appendChild(taskElement); // adds <li> to the <ul>
        };
    });
});
