run:
	cp src/config/config.dev.ts src/config/index.ts
	yarn start

prod:
	cp src/config/config.prod.ts src/config/index.ts
	yarn make
