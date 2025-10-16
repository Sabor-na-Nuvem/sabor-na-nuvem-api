#!/bin/sh

set -e

echo "Container iniciado. Rodando testes..."

npm test

echo "Testes passaram com sucesso. Iniciando o servidor de desenvolvimento..."

exec "$@"