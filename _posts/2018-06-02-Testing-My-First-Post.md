---
title: I'm testing my first post, what do you think?!
date: 2018-06-02 10:00:00 +0300
categories: software personal startups
---

Lorem ipsum dolor sit amet, consectetur **adipisicing elit**. Adipisci amet `autem blanditiis ducimus libero modi` mollitia nihil optio quasi, *quibusdam tempora*, vitae voluptatum. Aut enim necessitatibus non provident quas ***repellat***.

### Test...

```javascript
import { decorate, observable } from "mobx"

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
