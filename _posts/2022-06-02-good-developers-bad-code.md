---
title: Good developers; Bad code
category: Best Practices
tags:

- demo
- first post
- testing

---
Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.


<!--more-->


Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi`
mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas
***repellat***.

### Test...

```javascript
import {decorate, observable} from "mobx"

class Todo {
  id = Math.random();
  title = "";
  finished = false;
}

decorate(Todo, {
  title: observable,
  finished: observable
})

class TodoList {
  @observable todos = [];

  @computed get unfinishedTodoCount() {
    return this.todos.filter(todo => !todo.finished).length;
  }
}
```
