import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
// import { Todo } from '../../models/Todo';
import { GetTodos, AddTodo } from '../../store/actions/todo.action';
import { TodoState } from '../../store/states/todo.state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    imports: [MaterialModule, CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // @Select(TodoState.getTodoList) todos$!: Observable<Todo[]>;
  newItemName!: string;
  constructor(private store: Store) {}

  ngOnInit() {
    console.log("🟢 Dispatching GetTodos action...");
    this.store.dispatch(new GetTodos());
    this.store.dispatch(new AddTodo('hello world'));

    // this.todos$.subscribe(todos => {
    //     console.log('🟢 Todos Updated:', todos);
    //     if (todos.length === 0) {
    //         console.warn("⚠️ Todos array is empty! Check API or state.");
    //     }
    // });
}
addItem() {
  // this._store.dispatch(new AddTodo(this.newItemName));
  this.newItemName = '';
}

}