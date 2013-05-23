## see help(Startup) for documentation on ~/.Rprofile and Rprofile.site

#.Library.site <- "/usr/lib/R/site-library"
#.Library.site <- ""

local({
    # CRAN mirror
    r <- getOption("repos")
    # r["CRAN"] <- "http://cran.ms.unimelb.edu.au/"
    r["CRAN"] <- "http://mirror.aarnet.edu.au/pub/CRAN/"
    options(repos=r)
    
    # There's an AArnet Bioconductor mirror, but only from v2.7, thus R>=2.12
    if(as.numeric(R.Version()$minor) >= 12.0)
        bm <- "http://mirror.aarnet.edu.au/pub/bioconductor"
    else
        bm <- "http://bioconductor.org"
    options(BioC_mirror=bm)
    
    # set Ncpus to make installing packages faster
    switch(Sys.info()[["sysname"]],
        Darwin=options(Ncpus=as.numeric(system("sysctl -a hw | grep hw.ncpu: | sed 's/.*: //'", intern=TRUE))),
        Linux=options(Ncpus=as.numeric(system("cat /proc/cpuinfo | grep -c processor", intern=TRUE)))
    )
    
    # this forces Biobase to use this Bioconductor mirror, which means 'oligo' downloads pd* packages from the mirror
    # There's no point evaluating this code prior to R 2.12, as there was no AArnet mirror before then.
    if(as.numeric(R.Version()$minor) >= 12.0) {
        options(BioC=structure(list(Base = structure(list(urls = structure(list(bioc = getOption("BioC_mirror", default="http://bioconductor.org")), .Names = "bioc"),
            use.widgets = FALSE), .Names = c("urls", "use.widgets"), class = "BioCPkg")), .Names = "Base", class = "BioCOptions")
        )
    }
})
