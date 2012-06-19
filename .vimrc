colorscheme darkblue
set tabstop=4
set shiftwidth=4
set showmatch
set ruler
"set hls
set incsearch
set virtualedit=all
set mouse=a
set ignorecase

set cindent
set smartindent
set autoindent
set expandtab
set cinkeys=0{,0},:,0#,!^F

set number
set hlsearch

" use ghc functionality for haskell files
au Bufenter *.hs compiler ghc

" switch on syntax highlighting
syntax on

" enable filetype detection, plus loading of filetype plugins
filetype plugin on

" configure browser for haskell_doc.vim
let g:haddock_browser = "/usr/bin/firefox-3.5"
"let g:haddock_browser = "C:/Program Files/Opera/Opera.exe"
"let g:haddock_browser = "C:/Program Files/Mozilla Firefox/firefox.exe"
"let g:haddock_browser = "C:/Program Files/Internet Explorer/IEXPLORE.exe"

set completeopt=menu,menuone

set nocp


"nertree toggle
nmap <silent> <c-n> :NERDTreeToggle<CR>

"nerdcommenter comment style
let NERD_haskell_alt_style=1

"cpp .tem file highlight
au BufNewFile,BufRead *.tem set filetype=cpp

""VIM-LATEX

" REQUIRED. This makes vim invoke Latex-Suite when you open a tex file.
filetype plugin on

" IMPORTANT: win32 users will need to have 'shellslash' set so that latex
" can be called correctly.
set shellslash

" IMPORTANT: grep will sometimes skip displaying the file name if you
" search in a singe file. This will confuse Latex-Suite. Set your grep
" program to always generate a file-name.
set grepprg=grep\ -nH\ $*

" OPTIONAL: This enables automatic indentation as you type.
filetype indent on

" OPTIONAL: Starting with Vim 7, the filetype of empty .tex files defaults to
" 'plaintex' instead of 'tex', which results in vim-latex not being loaded.
" The following changes the default filetype back to 'tex':
let g:tex_flavor='latex'

" Search through files
nmap <F3> :silent exec "while !search( @/, \"W\") \| bnext \| 0 \| endwhile"<CR>
