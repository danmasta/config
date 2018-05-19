describe('from', () => {

    it('should load config from specified directory', () => {

        let local = config._from(__dirname + '/config');

        expect(local).to.be.an('object');

    });

    it('should load files based on same config options', () => {

        process.env['CONFIG_ID'] = 'test';

        let local = config._from(__dirname + '/config');

        expect(local.host).to.equal('localhost');
        expect(local.port).to.equal(8080);

        process.env['CONFIG_ID'] = undefined;

    });

    it('should be a new config instance', () => {

        let local = config._from(__dirname + '/config');

        expect(local === config).to.be.false;

    });


});
