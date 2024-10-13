import * as React from "react";

interface ChatInputProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ inputRef }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // Trigger the parent form's submit event
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit(); // Triggers the parent form's onSubmit
        }
      }
    };

    return (
      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-700">
        <textarea
          id="chat-input"
          name="message" // This name attribute will be used to retrieve the value in the parent form's onSubmit
          rows={1}
          ref={inputRef} // Attach the ref passed from the parent component
          onKeyDown={handleKeyDown}
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your message..."
        />
        <button
          type="submit"
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 text-blue-500 hover:bg-gray-600"
        >
          <svg
            className="w-5 h-5 rotate-90 rtl:-rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 20"
          >
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
    );
  }
);

export { ChatInput };
