import fileMap from './filemap.js'
import browserSync from 'browser-sync'
//* https://browsersync.io/docs/options
//! STATIC = HTML CSS JS
const isStaticServer = true;
let initTask
if (isStaticServer)
{
    initTask =  () =>
        browserSync.init({
            notify: false,
            reloadOnRestart: true,
            server : {
                //* use for debug
                // directory: true, 
                //* to serve multiple roots
                baseDir: [`${fileMap.build.pages}`, `${fileMap.build.folder}`],
                serveStaticOptions: {
                    extensions: ['html']
                },
                routes: {
                    //* relative path from gulpfile
                    // "/bower_components": "bower_components"
                }
            }
        })
}
else
{
    initTask =  () =>
        browserSync.init({
            proxy: '',
            notify: false
        })
}
export default initTask