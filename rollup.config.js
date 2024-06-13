import resolve from '@rollup/plugin-node-resolve';

export default [
    {
        input: [
            'index.cjs',
            'lib/config.js'
        ],
        output: {
            dir: 'dist/cjs',
            format: 'cjs',
            sourcemap: false,
            strict: false,
            preserveModules: true,
            exports: 'auto',
            entryFileNames: '[name].[format]',
            esModule: false
        },
        plugins: [
            resolve()
        ],
        external: [
            '@danmasta/lo',
            '@danmasta/lo/errors',
            'minimist'
        ]
    }
];
