# -*- coding: utf-8 -*-

import sys as mod_sys

args = mod_sys.argv[ 1: ]

def shrink( file_name ):
	f = open( file_name )
	javascript = f.read()
	f.close()

for file_name in args:
	shrink( file_name )

# TODO
