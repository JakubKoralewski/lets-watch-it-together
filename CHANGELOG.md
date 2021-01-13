# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project doesn't adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This was copied and pasted from https://keepachangelog.com/en/1.0.0/ and it's
probably not up to date, and is meant more to be used as a notepad.

## [Unreleased]

### Logging
Added logging with Pino. The pattern of inheriting from a parent error
to log the error was established as well. This error file (`libLogger.ts`) 
is a nice
centralised place of all the available errors that are expected
so I think it's a nice starting point for anyone to start exploring
the code.
