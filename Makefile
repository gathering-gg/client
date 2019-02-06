# Resource directory
#
# Default: 'resources'
RESOURCE_DIR := resources

# set vars depending on OS
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
	GOOS := darwin
	BINARY := gathering
else ifeq ($(UNAME_S),Linux)
	GOOS := linux
	BINARY := gathering
else
	BINARY := gathering.exe
	GOOS := windows
endif

$(RESOURCE_DIR)/$(GOOS)/$(BINARY):
	$(shell bash ./.travis/fetch_binary.sh $$GOOS)

# Check for binary, fail otehrwise
run:
	cp src/config/config.dev.ts src/config/index.ts
	yarn start

prod: $(RESOURCE_DIR)/$(GOOS)/$(BINARY)
	cp src/config/config.prod.ts src/config/index.ts
	yarn make

clean:
	-rm -rf out
	-rm $(RESOURCE_DIR)/windows/gathering.exe
	-rm $(RESOURCE_DIR)/darwin/gathering
	-rm $(RESOURCE_DIR)/linux/gathering
