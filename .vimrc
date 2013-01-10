set nocompatible               " be iMproved
filetype off                   " required!

set rtp+=~/.vim/bundle/vundle/
call vundle#rc()

" let Vundle manage Vundle
" required! 
Bundle 'gmarik/vundle'

" My Bundles here:
"
" original repos on github
"Bundle 'tpope/vim-fugitive'
"Bundle 'Lokaltog/vim-easymotion'
"Bundle 'rstacruz/sparkup', {'rtp': 'vim/'}
"Bundle 'tpope/vim-rails.git'
" vim-scripts repos
" Bundle 'L9'
" Bundle 'FuzzyFinder'
" non github repos
" Bundle 'git://git.wincent.com/command-t.git'
" ...
Bundle "The-NERD-tree"
Bundle 'The-NERD-Commenter'
let mapleader=","
Bundle 'surround.vim'
Bundle 'LargeFile'
"Bundle 'Tagbar'
"nmap <silent> <c-m> :TagbarToggle<CR>
Bundle 'derekwyatt/vim-scala'


filetype plugin indent on     " required!
"
" Brief help
" :BundleList          - list configured bundles
" :BundleInstall(!)    - install(update) bundles
" :BundleSearch(!) foo - search(or refresh cache first) for foo
" :BundleClean(!)      - confirm(or auto-approve) removal of unused bundles
"
" see :h vundle for more details or wiki for FAQ
" NOTE: comments after Bundle command are not allowed..
"
"set mouse=a
set tabstop=4
set shiftwidth=4
set ruler
set showmatch
set incsearch
set ignorecase
set cindent
set smartindent
set autoindent
set expandtab
set cinkeys=0{,0},:,0#,!^F
set number
set hlsearch

syntax on
syn on

filetype plugin on

let NERD_haskell_alt_style=1

au BufNewFile,BufRead *.tem set filetype=cpp
au BufNewFile,BufRead *.cu set filetype=cpp
au BufNewFile,BufRead *.h set filetype=cpp
au BufNewFile,BufRead *.scala set filetype=scala

nmap <silent> <c-n> :NERDTreeToggle<CR>
