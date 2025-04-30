 /** @type {import('tailwindcss').Config} */
 export default {
  content: ["./src/**/*.{html,js,tsx,jsx}",  "./node_modules/react-datepicker/dist/react-datepicker.css"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    }
  },
  plugins: [],
}