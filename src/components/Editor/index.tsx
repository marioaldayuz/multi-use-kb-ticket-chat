import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const editorConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'outdent',
    'indent',
    '|',
    'blockQuote',
    'insertTable',
    'undo',
    'redo'
  ],
  placeholder: 'Start writing...',
  removePlugins: ['MediaEmbed', 'EasyImage'],
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
    ]
  }
};

export default function Editor({ content, onChange, placeholder }: EditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={content}
        config={{
          ...editorConfig,
          placeholder: placeholder || editorConfig.placeholder
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}