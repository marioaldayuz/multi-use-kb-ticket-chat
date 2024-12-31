import { DragDropContext as DragDropContextBase, Droppable, DroppableProps } from 'react-beautiful-dnd';

// Create a wrapper component for Droppable that uses modern props pattern
export function DroppableWrapper(props: Omit<DroppableProps, 'placeholder'>) {
  return (
    <Droppable {...props}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-white rounded-lg shadow"
        >
          {props.children(provided, snapshot)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// Create a wrapper for DragDropContext to handle defaultProps warning
export const DragDropContext = (props: Parameters<typeof DragDropContextBase>[0]) => {
  return <DragDropContextBase {...props} />;
};