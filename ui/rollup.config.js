import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'

export default {
    input: 'src/app.js',
    output: {
        dir: 'dist'
    },
    plugins: [ resolve(),
        copy(
            {
                targets: [
                    { src: 'src/index.html', dest: 'dist/' },
                    { src: 'static', dest: 'dist/' }
                ]
            }
        )
    ]
}