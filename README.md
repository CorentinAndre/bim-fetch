# Next-fetch
Tiny (6.4kB, 2.2kB minified ! 🎉)Fetch wrapper using ES7 features such as async/await. 🐶  🎾

# Features
- Currently handles json only as a return value
- 4 different methods for GET / POST / DELETE / PUT
- Use only one promise ! No more callback hell :fire:!
- Send your parameters as an object. Next-fetch will take care of the formatting. Currently accepted parameters types are:
  - String
  - Number
  - Array
  - Date
- Set a default url to be used for every request. Override it by using an absolute url or by prepending a `/` to use your website base url
- Adds headers as an object. Next-fetch will take care of formatting the headers for you ! If you want to override a previous header, just add it again.
- Error handling is built-in. Any request returning an error code outside of the range 200-310 will throw an error. You can also set your own error handling function


# How to use (coming soon)

# Browser support (coming soon as well as a version for older browsers)
