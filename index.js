const util = require('util');

// through2 is a thin wrapper around node transform streams
const through2    = require('through2');
const gutil       = require('gulp-util');
const PluginError = gutil.PluginError;
const WebIO       = require('web-io').WebIO;

const HTML_AND_MARKDOWN_RE = /\.(html|md)$/;

function gulpWebIO(options) {
  
  /**
   * Instantiate webIO with the given options
   */
  var webIO = new WebIO(options);

  // Creating a stream through which each file will pass
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    
    if (file.isBuffer() && HTML_AND_MARKDOWN_RE.test(file.path)) {
      var relativePath = webIO.truncateFsRoot(file.path);
      
      return webIO.renderPath(relativePath).then((rendered) => {
        
        // replace contents
        file.contents = Buffer.from(rendered, 'utf8');
        
        // rewrite file.path
        // TODO: this will probably move into the web-io module
        // itself
        file.path = file.path.replace(HTML_AND_MARKDOWN_RE, '.html')
        
        this.push(file);
        cb();
      })
      .catch(err => {
        console.log('error', err, file.path);

        cb();
      });
    }
    
    if (file.isStream()) {
      throw new PluginError('gulp-web-io', 'Streams not currently supported');
    }

    cb(null, file);
  });
}

// Exporting the plugin main function
module.exports = gulpWebIO;
