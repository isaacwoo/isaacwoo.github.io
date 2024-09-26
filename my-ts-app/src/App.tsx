import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import TodoList from './TodoList';
import ConfirmModal from './ConfirmModal';
import './App.css';

interface List {
  id: string;
  name: string;
}

function DraggableLists({ lists, setLists, onDeleteList }: { 
  lists: List[], 
  setLists: React.Dispatch<React.SetStateAction<List[]>>, 
  onDeleteList: (id: string) => void 
}) {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, listId: '', listName: '' });

  const onDragEnd = (result: DropResult) => {
    console.log('Drag ended:', result);
    if (!result.destination) {
      return;
    }

    const newLists = Array.from(lists);
    const [reorderedItem] = newLists.splice(result.source.index, 1);
    newLists.splice(result.destination.index, 0, reorderedItem);

    setLists(newLists);
  };

  const handleDeleteWithConfirmation = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, listId: id, listName: name });
  };

  const handleConfirmDelete = () => {
    onDeleteList(confirmModal.listId);
    setConfirmModal({ isOpen: false, listId: '', listName: '' });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, listId: '', listName: '' });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="lists-container"
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={list.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`list-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <TodoList
                        id={list.id}
                        name={list.name}
                        onDelete={() => handleDeleteWithConfirmation(list.id, list.name)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={`确定要删除列表 "${confirmModal.listName}" 吗？此操作不可撤销。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

function App() {
  const [lists, setLists] = useState<List[]>(() => {
    const savedLists = localStorage.getItem('todo_lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    localStorage.setItem('todo_lists', JSON.stringify(lists));
  }, [lists]);

  const handleAddList = () => {
    if (newListName.trim() !== '') {
      const newList: List = {
        id: Date.now().toString(),
        name: newListName.trim()
      };
      setLists([...lists, newList]);
      setNewListName('');
    }
  };

  const handleDeleteList = (id: string) => {
    const newLists = lists.filter(list => list.id !== id);
    setLists(newLists);
    localStorage.removeItem(`todos_${id}`);
  };

  return (
    <div className="App">
      <h1>多个待办事项列表</h1>
      <div className="new-list-form">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="输入新的列表名称"
        />
        <button onClick={handleAddList}>创建新列表</button>
      </div>
      <DraggableLists lists={lists} setLists={setLists} onDeleteList={handleDeleteList} />
    </div>
  );
}

export default App;
