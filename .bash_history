tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
vim run.out 
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
cat project-summary.csv 
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
cat run.out 
rm -rf ./*
ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
rm -rf ./*
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
clear
ls
tail -rf run.out 
tail -f run.out 
ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail run.out 
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
rm -rf ./*
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
vim run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
vim run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
vim run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
tail -f run.out 
ls
ulimit -n
qlogin
qlogin -l pwbc
qlogin -pe smp 64
screen -ls
cd dev/galaxy_pipeline
ls
vim
ls
ls 127\:/
rm -rf 127\:/
ls
cd dev/galaxy_pipeline
ls
vim
cd dev/galaxy_pipeline
ls
cd bcbb/nextgen/
ls
git status
git diff
module load kevyin/init_pipeline_dev 
python setup.py install
qlogin -pe smp 32
qstat
screen -ls
screen -S wolf_local_mediumtest_G1L1L2_run
clear
screen -ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
clear
git status
git diff
git log
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
git status
git diff
git status
git add bcbio/variation/genotype.py 
git status
git commit -m 
git status
git commit -m "max file handles for gatk"
git status
git checkout -- bcbio/distributed/transaction.py 
git status
python setup.py install
man git
git -h
git --help | less
git commit --help | less
git-commit -h
git commit -h
git commit -h | less
git status
git log
git branch
git log
python setup.py install
git log
git show 292394ce504ea83b330b146709c0946391f3fe7c
git log
git show 67095a42473ff247b86649cca17a2703dfe4bac9
git status
git log
git checkout cb46
git log
git status
git branch
git checkout master
git status
git log
ls
git checkout cb46
git apply 292394ce504ea83b330b146709c0946391f3fe7c
git format-patch -1 292394ce504ea83b330b146709c0946391f3fe7c
ls
git log
cat 0001-max-file-handles-for-gatk.patch 
git status
man apply
man patch
patch 0001-max-file-handles-for-gatk.patch 
patch <  0001-max-file-handles-for-gatk.patch 
patch -1 <  0001-max-file-handles-for-gatk.patch 
man patch
patch -p1 <  0001-max-file-handles-for-gatk.patch 
ls
patch -p2 <  0001-max-file-handles-for-gatk.patch 
git status
python setup.py install
ls
git log
git format-patch -1 89d57d2c3af5f0a42a7876aa4dce356bb2cb1c2f
ls
git status
git checkout 8f9969e02f3d4d36c34d05b70cbe2db0e1b4b017
patch -p1 0001-no-more-var-tmp-was-giving-out-of-memory-errors.patch 
patch -p1 < 0001-no-more-var-tmp-was-giving-out-of-memory-errors.patch 
patch -p2 < 0001-no-more-var-tmp-was-giving-out-of-memory-errors.patch 
ls
python setup.py install
git log
git show 3f3a0c9ed9e2867a83262c437b62945bb5897f44
git log
git checkout 48b4f84632ec26eb07b938ce5df56ab40707e398
python setup.py install
git log
git show 3f3a0c9ed9e2867a83262c437b62945bb5897f44
git log
git show 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
git log
git checkout 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
patch -p2 < 0001-no-more-var-tmp-was-giving-out-of-memory-errors.patch 
git log
git diff
git status
python setup.py install
git status
git checkout bcbio/distributed/
git status
git stash
git status
git log
git status
git branch
git checkout master
git status
git log
git bisect start
cd ..
git bisect start
git bisect bad
git log
git checkout 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
python setup.py install
cd nextgen/
python setup.py install
cd ..
git log
git checkout b65d8ddf864395d8d7d2efc11be6ff1a8b0aa7f3
git status
cd nextgen/
python setup.py install
python setup.py install --record files.txt
ls
cat files.txt | xargs rm -rf
ls
python setup.py install
ls
git log
git bisect good b65d8ddf864395d8d7d2efc11be6ff1a8b0aa7f3
cd ..
git bisect good b65d8ddf864395d8d7d2efc11be6ff1a8b0aa7f3
ls
cd nextgen/
sh reinstall.sh 
git bisect good
cd ..
git bisect good
ls
cd nextgen/
sh reinstall.sh 
git status
git checkout master
sh reinstall.sh 
git log
git status
git log
git show cb461e50efc9da8b8fbfdb7c6c9387269e0da195
git log
git checkout  cb461e50efc9da8b8fbfdb7c6c9387269e0da195
sh reinstall.sh 
git log
git checkout master
git log
git checkout 67095a42473ff247b86649cca17a2703dfe4bac9
git log
git show cb461e50efc9da8b8fbfdb7c6c9387269e0da195
git log
git show 67095a42473ff247b86649cca17a2703dfe4bac9
git log
cd ..
git bisect reset
ls
cd nextgen/
ls
git log
git checkout 67095a42473ff247b86649cca17a2703dfe4bac9
git commit --amend -v
git rebase --onto Head 67095a42473ff247b86649cca17a2703dfe4bac9 master
git rebase --onto Head 67095a42473ff247b86649cca17a2703dfe4bac9 
git rebase --onto HEAD 67095a42473ff247b86649cca17a2703dfe4bac9 master
git status
git add bcbio/distributed/transaction.py
git rebase --onto HEAD 67095a42473ff247b86649cca17a2703dfe4bac9 master
git status
git diff  bcbio/distributed/transaction.py
git diff HEAD bcbio/distributed/transaction.py
git commit -m "removed log msgs"
git rebase --onto HEAD 67095a42473ff247b86649cca17a2703dfe4bac9 master
git log
git status
git branch
git log
python setup.py install
git branch
git log
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
python setup.py install
sh reinstall.sh 
git checkout master
git log
sh reinstall.sh 
git log
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
sh reinstall.sh 
git log
git status
git log
patch -p2 <  0001-max-file-handles-for-gatk.patch 
sh reinstall.sh 
git log
git checkout b65d8ddf864395d8d7d2efc11be6ff1a8b0aa7f3
git checkout master
git diff
git stash
git checkout master
git log
git show 3f3a0c9ed9e2867a83262c437b62945bb5897f44
git log
git show 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
git log
git checkout 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
sh reinstall.sh 
git log
git checkout master
git log
git checkout 48b4f84632ec26eb07b938ce5df56ab40707e398
sh reinstall.sh 
git checkout master
git log
sh reinstall.sh 
git log
git checkout f747089cddcb0975a62f87e618a4b1ea99f33be1
sh reinstall.sh 
git log
git checkout master
git log
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
sh reinstall.sh 
git log
git checkout master
git status
git log
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
ls
patch -p2 <  0001-max-file-handles-for-gatk.patch 
git status
sh reinstall.sh 
git status
git diff
git stash
git log
sh reinstall.sh 
git log
git diff
vim 0001-max-file-handles-for-gatk.patch 
patch -p2 <  0001-max-file-handles-for-gatk.patch 
sh reinstall.sh 
man apply
man patch
patch -R -p2 <  0001-max-file-handles-for-gatk.patch 
vim bcbio/variation/genotype.py 
patch -p2 <  0001-max-file-handles-for-gatk.patch 
vim bcbio/variation/genotype.py 
patch -p2 <  0001-max-file-handles-for-gatk.patch 
python setup.py install
sh reinstall.sh 
vim bcbio/variation/genotype.py 
sh reinstall.sh 
git checkout master
git stash
git checkout master
git status
git log
git status
git commit -v --amend
git status
git add bcbio/variation/genotype.py
git status
git add bcbio/variation/genotype.py
git status
git commit -v --amend
git log
git status
sh reinstall.sh 
vim
ls
git status
git diff
git status
git add bcbio/variation/genotype.py 
git commit -v --amend
git add reinstall.sh 
git commit -m "python reinstall module script"
sh reinstall.sh 
ls
ls files\:/
rm -rf files\:/
rm -rf ulimit\:/
ls
cd dev/
ls
cd galaxy_pipeline
ls
git status
cd bcbb/nextgen/
ls
qstat
cd dev/galaxy_pipeline
ls
vim
screen -ls
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_local_mediumtest_G1L1L2_wd_dev
ls
tail -f run.out 
cd ..
cd wolf_messaging_mediumtest_G1L1L2_wd2/
ls
cd ..
rm -rf wolf_messaging_mediumtest_G1L1L2_wd2/
mkdir wolf_messaging_mediumtest_G1L1L2_wd_dev
cd wolf_messaging_mediumtest_G1L1L2_wd_dev/
ls
screen -S wolf_messaging_mediumtest_G1L1L2_run
ls
tail bcbio_nextgen.py.o13313 
ls
tail -f bcbio_nextgen.py.o13313 nextgen_analysis_server.py.o13314 
screen -r wolf_messaging_mediumtest_G1L1L2_run
ls
tail -f bcbio_nextgen.py.o13315 
ls
tail -f bcbio_nextgen.py.o13315 
ls
tail nextgen_analysis_server.py.o13316 
tail -f nextgen_analysis_server.py.o13316 
vim 
ls
vim
screen -r wolf_messaging_mediumtest_G1L1L2_run
ls
tail -f run.out
ls
vim run.out 
ls
vim hs_err_pid31351.log 
ls
screen -r wolf_messaging_mediumtest_G1L1L2_run
cd /share/ClusterShare/software/contrib/kevyin/gatk/
ls
cd 2.2-8/gatk/
ls
java -jar GenomeAnalysisTK.jar  -h | less
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_local_mediumtest_G1L1L2_wd_dev
ls
vim
cd ..
mkdir wolf_local_mediumtest_G1L1L2_wd_prod
cd wolf_local_mediumtest_G1L1L2_wd_prod/
ls
module unload kevyin/init_personal 
module load kevyin/init_personal 
module load kevyin/init_sample_tracking 
ls
which python
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
ls
cd ..
cd wolf_local_mediumtest_G1L1L2_wd_dev/
ls
rm -rf ./*
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
screen -ls
ls
module unload kevyin/init_sample_tracking 
ls
rm -rf ./*
module load kevyin/init_pipeline_dev 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
cat run.out 
git log
git status
ls
rm ./*
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm -rf ./*
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
cat run.out 
vim run.out 
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
cat run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
cat run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
cat run.out 
ls
rm run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
cat run.out 
vim run.out 
ls
vim
ls
ll alignments/
cd ..
ls
ll
cd wolf_local_mediumtest_G1L1L2_wd_dev/
ll
ls
ll alignments/
ll fastqc/
ll
head *grp
vimm
vim
ls
ls | grep sort-dup
ll
ls /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_local_mediumtest_G1L1L2_wd_dev/alignments/L002_301112_G1_L1_L2-sort.bam
ls -lah /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_local_mediumtest_G1L1L2_wd_dev/alignments/L002_301112_G1_L1_L2-sort.bam
vim
ll
ls
mv gatk/ gatk-rm
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
ls
cat gatk
ls gatk
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm run.out 
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
vim run.out 
ls
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
rm -rf gatk/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 32 &> run.out
ls
rm -rf ./*
exit
ls
module load kevyin/init_pipeline_dev 
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
vim
ls
vim nextgen_analysis_server.py.o13314 
vim
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim nextgen_analysis_server.py.o13318
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_local_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t local -n 64 &> run.out
vim run.out 
ls
vim
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls /share/ClusterShare/software/contrib/kevyin/python/2.7.2-dev/bin/bcbio_nextgen.py
ls /share/ClusterShare/software/contrib/kevyin/python/2.7.2-dev/bin/
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
vim 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
ls
git log
ls
module unload kevyin/init_pipeline_dev 
module load kevyin/init_sample_tracking 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
ls *split
ls | grep split
ls | grep split | rm
ls | grep split | xargs rm
ls | grep split | xargs rm -rf
ls
module unload kevyin/init_sample_tracking 
module load kevyin/init_pipeline_dev 
vim
which python
ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
exit
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
ls
cd wolf_local_mediumtest_G1L1L2_wd/
ls
cd ..
mkdir wolf_local_mediumtest_G1L1L2_wd_dev
cd wolf_local_mediumtest_G1L1L2_wd_dev/
ls
qlogin -pe smp 64
qlogin -pe smp 32
pip freeze
module load kevyin/init_sample_tracking 
pip freeze
pip freeze > ~/tmp/st_dep.txt
cd
cd dev/sunny/
ls
vim
git status
git add python-reinstall.sh 
git bam2fastq.sh 
git add largest_dirs.sh 
git status
gi add bam2fastq.sh 
git add bam2fastq.sh 
git status
git commit -m "scripts"
git push origin master
ls
git add remote origin https://github.com/kevyin/sunny.git
git remote origin https://github.com/kevyin/sunny.git
git remote add origin https://github.com/kevyin/sunny.git
git status
git push origin master
git pull
git merge
ls
git pull master
git pull origin master
ls
git status
ls
git status
git push origin master
ls
vim .git/config 
git status
ls
cd dev/galaxy_pipeline
ls
cd bcbb/nextgen/
ls
git bisect start
git bisect bad
cd ..
git bisect start
git bisect bad
ls
git log
git bisect bad cb461e50efc9da8b8fbfdb7c6c9387269e0da195
git log
git bisect bad 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
git log
cat /share/ClusterShare/Modules/modulefiles/contrib/kevyin/init_pipeline_dev 
cat /share/ClusterShare/Modules/modulefiles/contrib/kevyin/init_sample_tracking 
vim /share/ClusterShare/Modules/modulefiles/contrib/kevyin
pip install -h
git status
cd ..
ls
git status
git add nextgen_config/
git status
cat TODO
vim TODO
git status
git commit -m "config yamls"
git status
git add TODO
git commit -m "todo"
git add bcbb
git status
git commit -m "bcbb"
git status
git add nextgen_test
git status
git add nextgen_tests/
git status
git commit -m "run_info for L1L2"
git status
git push origin master
git log
git push origin master
vim .git/config 
git log
ls
git status
vim TODO 
git status
git add TODO
git commit -m "test commit"
git status
git push origin master
git pull
git pull origin master
git push origin master
cd ..
ls
cd ..
cd tmp
ls
git clone /misc/FacilityBioinformatics/private/kevyin/gitrepos/galaxy_pipeline
ls
cd galaxy_pipeline/
ls
vim TODO 
cd ..
rm -rf galaxy_pipeline/
cd ..
ls
cd dev/galaxy_pipeline
ls
vim .git/config 
git status
git branch
git push origin autorun
git diff
ls
cd dev/galaxy_pipeline
ls
vim
ll
ping
vim
ls
cd dev/galaxy_pipeline
ls
cd bcbb/nextgen/
ls
git log
git format-patch -1 c2aa4fd3928bd121143b3f8947e67c5bf4301b2f
git format-patch -1 a7a234327ce6a27aa4c565a647e5dff740370c0c
git checkout cb461e50efc9da8b8fbfdb7c6c9387269e0da195
git status
ls
vim 0001-max-file-handles-for-gatk.patch 
patch -p2 <  0001-max-file-handles-for-gatk.patch 
ls
patch -p2 <  0001-python-reinstall-module-script.patch 
ls
sh reinstall.sh 
module load kevyin/init_pipeline_dev 
sh reinstall.sh 
git log
git checkout 5090ac3b035b331105e0aa6f2afcc6f0ae9fc422
git status
sh reinstall.sh 
pip install pysam
pip install pysam --upgrade
sh reinstall.sh 
git log
git show 3f3a0c9ed9e2867a83262c437b62945bb5897f44
pip -h
pip uninstall pysam
pip -h
pip freeze
pip install pysam
pip install pysam-0.6
pip install -h
pip install pysam==0.6
git log
git checkout 3f3a0c9ed9e2867a83262c437b62945bb5897f44
sh reinstall.sh 
ls
git diff
sh reinstall.sh 
git log
git checkout 7c0bf996379ce73765c5732bcb0885412b9c4e61
sh reinstall.sh 
git checkout master
git stash
git checkout master
git checkout master --force
ls
cat reinstall.sh 
pip -h
pip install -h
pip -h
pip install -h
pip install -r ~/tmp/st_dep.txt 
vim ~/tmp/st_dep.txt 
pip uninstall -h
which python
pip freeze > pkgs.tmp
pip uninstall -yr pkgs.tmp 
ls
vim pkgs.tmp 
pip uninstall wsgiref
ls
pip install -r ~/tmp/st_dep.txt 
pip install numpy
pip install -r ~/tmp/st_dep.txt 
python setup.py install
git log
ls
mv reinstall.sh python-reinstall.sh
cp python-reinstall.sh ~/dev/sunny/
ls
git status
git log
ls
git mv reinstall.sh python-reinstall.sh 
mv python-reinstall.sh reinstall.sh
git mv reinstall.sh python-reinstall.sh 
git status
git commit -m "rename to python-reinstall.sh"
git status
ls
rm *.patch
ls
cat files.txt 
rm files.txt 
ls
ll
git status
mv pkgs.tmp working_python_pkgs.txt
git add working_python_pkgs.txt 
git sattus
git status
git commit -m "list of working python packages use pipe install -r to install"
git commit --amend
git log
ls
ll
ls scripts/
git status
git push origin master
vim ../.git
cd ../..
ls
git status
vim
cd bcbb/nextgen/
ls
git push origin master
ls
cd ../..
ls
cd bcbb/nextgen/
python setup.py install
git diff
python setup.py install
df
python setup.py install
df
python setup.py install
ls
screen -ls
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_messaging_mediumtest_G1L1L2_wd_dev
clear
ls
tail -f bcbio_nextgen.py.o13319 
vim
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
ls
tail -f bcbio_nextgen.py.o13325 
ls
tail -f bcbio_nextgen.py.o13325 
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
module load kevyin/init_pipeline_dev 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
ls
vim
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
vim
vim project-summary.csv 
pip install -h
cd ..
mkdir wolf_messaging_large_G1all_wd_dev
cd wolf_messaging_large_G1all_wd_dev/
ls
screen -S wolf_messaging_large_G1all_wd_dev
qstat
ls
qstat
tail -f bcbio_nextgen.py.o13335 nextgen_analysis_server.py.o13336 
ls
vim
screen -r wolf_messaging_large_G1all_wd_dev
ls
vim
screen -r wolf_messaging_large_G1all_wd_dev
ls
vim
ls tmp
ls tmp/
ll tmp/
du -sh tmp/
ls
ls tmp/tmpqQToPu/
ls tmp/tmpqQToPu/tmp/
ls
screen -r wolf_messaging_large_G1all_wd_dev
screen -ls
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
clear
screen -ls
screen -r 16138.wolf_messaging_mediumtest_G1L1L2_wd2
clear
screen -ls
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
ls
screen -ls
screen -r 7851.wolf_messaging_large_G1all_wd_dev
clear
screen -ls
screen -r 16138.wolf_messaging_mediumtest_G1L1L2_wd2
clear
qstat
screen -ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
screen -d -r 17174.wolf_local_mediumtest_G1L1L2_run
screen -ls
qstat
qdel 13312
screen -ls
screen -r 28255.wolf_messaging_mediumtest_G1L1L2_run
screen -ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
man screen
screen -ls
screen -r 17174.wolf_local_mediumtest_G1L1L2_run
screen -ls
qstat
ls
screen -ls
ls
module load kevyin/init_pipeline_dev 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
cd ..
ls
cd wolf_local_mediumtest_G1L1L2_wd/
ls
cd ..
screen -ls
cd wolf_messaging_mediumtest_G1L1L2_wd
cd ..
cd wolf_messaging_mediumtest_G1L1L2_wd2
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
vim 
screen -ls
ls
cd ..
ls
cd ..
cd /misc/FacilityBioinformatics/
cd private/Illumina_HiSeq_2000_Runfolder/
ls
cd wolf_messaging_mediumtest_G1L1L2_wd_dev/
ls
vim
ls
rm -rf ./*
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
cd ..
cd wolf_messaging_large_G1all_wd_dev/
ls
vim
ls
screen -ls
cd ..
exit
ls
qstat
ls
rm -rf ./*
ls
screen -ls
exit
cd ..
cd wolf_messaging_mediumtest_G1L1L2_wd_dev/
ls
vim
ls
rm -rf ./*
ls
which python
module load kevyin/init_pipeline_dev 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
exit
ls
screen -ls
qstat
screen -ls
screen -r 7851.wolf_messaging_large_G1all_wd_dev
clear
screen -ls
screen -r 16138.wolf_messaging_mediumtest_G1L1L2_wd2
ls
screen -r 16138.wolf_messaging_mediumtest_G1L1L2_wd2
screen -ls
clear
screen -ls
screen -r 7851.wolf_messaging_large_G1all_wd_dev
clear
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
cd wolf_messaging_large_G1all_wd_dev/
vim
ls
ll
ll alignments/
ll tmp/
ll tmp/tmpYnj_YL/tmp/
which python
screen -r 7851.wolf_messaging_large_G1all_wd_dev
ls
tail -f bcbio_nextgen.py.o13376 nextgen_analysis_server.py.o13377 
ls
screen -ls
which python
ls ../
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_large_G1all.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/array10/110614_SN103_0846_BD03UMACXX/unaligned/Project_Genome/Sample_G1/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-all.yaml -t messaging
ls
rm -rf ./tmp/
ls
ls alignments/
ll alignments/
ls
rm -rf ./*
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_large_G1all.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/array10/110614_SN103_0846_BD03UMACXX/unaligned/Project_Genome/Sample_G1/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-all.yaml -t messaging
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_large_G1all.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/array10/110614_SN103_0846_BD03UMACXX/unaligned/Project_Genome/Sample_G1/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-all.yaml -t messaging
ls
rm -rf ./*
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_large_G1all.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/array10/110614_SN103_0846_BD03UMACXX/unaligned/Project_Genome/Sample_G1/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-all.yaml -t messaging
vim
ls
rm -rf ./*
ls
qstat
exit
ls
cd dev/
ls
cd galaxy_pipeline
ls
vim
ls
cp -r galaxy_dist_dev_ln galaxy_dist_dev_ln2/
mv galaxy_dist_dev_ln galaxy_dist_dev_ln1
ls galaxy_dist_dev_ln1
ls galaxy_dist_dev_ln2
cd galaxy_dist_dev_ln2
ls
vim
cd ..
vim
cd dev/
ls
cd galaxy_pipeline
cd bcbb/nextgen/
ls
git diff
qstat
qstat -f -u "*"
git diff
python setup.py install
module load kevyin/init_pipeline_dev 
python setup.py install
git diff
qstat
screen -ls
screen -S wolf_messaging_ln2_large_G1all_wd_dev
clear
screen -ls
qstat
screen -S wolf_messaging_ln1_medium_G1L1L2_wd_dev
clear
cd /misc/FacilityBioinformatics/
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
ls
cd wolf_messaging_mediumtest_G1L1L2_wd_dev/
ls
vim
cd ..
ls
cd wolf_messaging_large_G1all_wd_dev/
vim
screen -ls
screen -S wolf_messaging_mediumtest_G1L1L2_run
screen -r wolf_messaging_mediumtest_G1L1L2_run
ls
qstat
qdel 13378
qdel 13379
screen -ls
screen -r 19030.wolf_messaging_mediumtest_G1L1L2_run
screen -ls
ls
tail -f bcbio_nextgen.py.po13376 nextgen_analysis_server.py.po13377 
ls
screen -ls
screen -r 7851.wolf_messaging_large_G1all_wd_dev
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
ls
ll
mv wolf_messaging_large_G1all_wd_dev/ wolf_messaging_ln2_large_G1all_wd_dev/
cd wolf_messaging_ln2_large_G1all_wd_dev/
ls
which python
module load kevyin/init_pipeline_dev 
ls
which python
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_ln2_large_G1all.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/array10/110614_SN103_0846_BD03UMACXX/unaligned/Project_Genome/Sample_G1/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-all.yaml -t messaging
ls
rm -rf ./*
exit
screen -ls
exit
ls
htop
python celery
celery
ssh gamma00
qstat
screen -ls
exit
#1356658205
screen -ls
#1356658208
exit
#1356658058
screen -S flower_gamma02
#1356658254
clear
#1356658256
exit
cd dev/galaxy_pipeline/nextgen_testdir/transfer/log_auto/
ls
tail -f nextgen_pipeline.log 
exit
cd dev/
ls
cd galaxy_pipeline
ls
git status
du -sh nextgen_tests/
cd bcbb
git status
git diff
git add nextgen/bcbio/pipeline/
git status
git commit -m "logger messages in pipeline:main"
git status
git push origin master
ls
git push origin master
ls
cd ..
ls
git status
git add bcbb/
git diff nextgen_config/
git status
git commit -m "logger messages, successful run for SNP Calling"
ls
git status
git add nextgen_tests/
git status
git add nextgen_config/
git status
git commit -m "Added tests and configurations"
git status
git push origin master
ls
git status
git branch
git branch autorun
git branch
git checkout autorun
ls
cd bcbb/nextgen/
ls
module load kevyin/init_sample_tracking 
illumina_finished_msg.py --help
vim ~/.bash_history 
illumina_finished_msg.py --help
ls
cd ../..
ls
cd nextgen_testdir/nextgen_wd/
mkdir auto_wd
cd auto_wd/
ls
illumina_finished_msg.py --help
illumina_finished_msg.py -psfq ../../../nextgen_config/maggi/transfer_info.yaml 
ls
illumina_finished_msg.py -psfq ../../../nextgen_config/maggi/transfer_info.yaml 
pwd
illumina_finished_msg.py -psfq ../../../nextgen_config/maggi/transfer_info.yaml 
illumina_finished_msg.py -sfq ../../../nextgen_config/maggi/transfer_info.yaml 
qstat
illumina_finished_msg.py -sfq ../../../nextgen_config/maggi/transfer_info.yaml 
qstat
illumina_finished_msg.py -sfq ../../../nextgen_config/maggi/transfer_info.yaml 
qstat
illumina_finished_msg.py -sfq ../../../nextgen_config/maggi/transfer_info.yaml 
exit
#1356659327
rabbitmqctl
#1356659351
exit
#1356659124
ps ax | grep rabbit
#1356659138
vim /var/log/rabbitmq/rabbit@nerv-geofront.log
#1356659304
rabbitmqctl
#1356659432
rabbitmq-plugins enable rabbitmq_management
#1356659440
sudo rabbitmq-plugins enable rabbitmq_management
#1356658404
screen -ls
#1356658411
screen -r 22960.toplevel
#1356658420
screen -ls
#1356658423
clear
#1356658425
screen -ls
#1356658429
screen -r 22480.nextgen_auto
#1356658434
clear
#1356658434
ls
#1356658437
screen -ls 
#1356658441
screen -r 8076.flower_gamma02
#1356659005
clear
#1356659008
ps ax | grep rabbit
#1356659052
vim /var/log/rabbitmq/rabbit@gamma02.log
#1356659117
ssh nerv-geofront
#1356660696
cd /var/log/rabbitmq
#1356660697
ls
#1356660698
vim
qstat
screen -ls
screen -r 20048.wolf_messaging_ln1_medium_G1L1L2_wd_dev
clear
screen -ls
screen -r 19732.wolf_messaging_ln2_large_G1all_wd_dev
clear
ls
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
cd wolf_messaging_ln1_medium_G1L1L2_wd_dev/
tail -f bcbio_nextgen.py.o13382 nextgen_analysis_server.py.o13383 
cd ..
cd wolf_messaging_ln2_large_G1all_wd_dev/
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
qstat
qstat -f -u "*"
vim
ls
ls tmp/
cd ..
mkdir wolf_messaging_ln2_medium_G1L1L2_wd_dev
cd wolf_messaging_ln2_medium_G1L1L2_wd_dev/
ls
screen -ls
screen -r 19732.wolf_messaging_ln2_large_G1all_wd_dev
vim
cd
cd dev/galaxy_pipeline
vim
exit
qstat
screen -ls
screen -r 19732.wolf_messaging_ln2_large_G1all_wd_dev
clear
screen -S wolf_messaging_ln2_medium_G1L1L2_wd_dev
clear
screen -ls
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
clear
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
cd wolf_messaging_ln2_medium_G1L1L2_wd_dev/
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
ls
vim ~/.bash_profile
ls
vim ~/.bash_profile
vim ~/.bash_history 
#1356658017
screen -ls
#1356658025
screen -r 20048.wolf_messaging_ln1_medium_G1L1L2_wd_dev
#1356658324
clear
#1356658332
screen -ls
#1356658340
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356658372
clear
#1356658373
ls
#1356658379
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356658460
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356658461
clear
#1356658470
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356658556
screen -ls
#1356658566
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356658765
ls
#1356658770
tail -f bcbio_nextgen.py.o13405 
#1356658807
ls
#1356658812
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356658970
ls
#1356658977
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356659257
ls
#1356659299
rabbitmqctl
#1356659324
ssh gamma02
#1356659353
ls
#1356659357
vim
#1356659594
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356659601
clear
#1356659604
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356659609
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356659643
clear
#1356659645
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356660403
screen -ls
#1356660412
screen -S toplevel_dev
#1356660469
screen -ls
#1356660478
screen -r 23848.toplevel_dev
#1356660481
screen -ls
#1356660547
screen -r
#1356660558
screen -r 23690.toplevel_dev
#1356662827
screen -ls
#1356662835
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356662857
qstat
#1356662864
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356662882
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356663573
clear
#1356663575
screen -ls
#1356663589
screen -S wolf_messaging_ln1_large_G1all_wd_dev
#1356663690
clear
#1356663763
qstat
#1356663774
cd ..
#1356663780
cd wolf_messaging_ln1_large_G1all_wd_dev/
#1356663781
ls
#1356663787
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356663821
ls
#1356663826
vim
#1356663838
screen -ls
#1356663844
screen -r 24718.wolf_messaging_ln1_large_G1all_wd_dev
#1356663846
clear
#1356663851
screen -r 24718.wolf_messaging_ln1_large_G1all_wd_dev
#1356663862
clear
#1356663864
ls
#1356663867
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356663942
qstat
#1356663948
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356663967
qstat -f -u "*"
#1356663981
ls
#1356663985
vim
#1356664200
tail -f bcbio_nextgen.py.o* nextgen_analysis_server.py.o*
#1356664233
screen -r 24718.wolf_messaging_ln1_large_G1all_wd_dev
#1356664251
clear
#1356664253
screen -ls
#1356664261
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356664320
clear
screen -ls
ls
cd dev/galaxy_pipeline
ls
celery status
module load kevyin/init_pipeline_dev 
module unload kevyin/init_pipeline_dev 
module load kevyin/init_sample_tracking 
celery status
vim ~/.bash_history 
flower -h
screen -S flower_nerv
ssh gamma02
cd /var/log/rabbitmq/
ls
vim
ps ax | grep rabbit
#1356661830
cd /var/log/rabbitmq
#1356661831
vim
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
ls
mv wolf_messaging_mediumtest_G1L1L2_wd_dev/ wolf_messaging_ln1_medium_G1L1L2_wd_dev/
ls
cd wolf_messaging_ln1_medium_G1L1L2_wd_dev/
ls
vim
ls
rm -rf ./*
ls
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_ln1_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
module load kevyin/init_pipeline_dev 
bcbio_nextgen.py ~/dev/galaxy_pipeline/nextgen_config/wolfpack/post_process_messaging_ln1_mediumtest_G1L1L2.yaml /home/kevyin/dev/galaxy_pipeline/nextgen_testdir/dump_dir/medium-test/ /home/kevyin/dev/galaxy_pipeline/nextgen_tests/G1/run_info-L1L2.yaml -t messaging
vim
exit
#1356664569
screen -ls
#1356664575
screen -r  20048.wolf_messaging_ln1_medium_G1L1L2_wd_dev
#1356664577
clear
#1356664579
screen -ls
#1356664583
screen -r 24718.wolf_messaging_ln1_large_G1all_wd_dev
#1356664586
clear
#1356664588
screen -ls
#1356664592
screen -r 21586.wolf_messaging_ln2_medium_G1L1L2_wd_dev
#1356664594
clear
#1356664597
exit
#1356669110
screen -ls
#1356682592
ls /home/kevyin/bin/meme/db/motif_databases/JASPAR_CORE_2009.meme
#1356682597
ls /home/kevyin/bin/meme/db/motif_databases/
#1356682604
cd /home/kevyin/bin/meme/db/motif_databases/
#1356682710
mkdir -p /home/kevyin/bin/meme/db/motif_databases/
#1356682720
cd bin/meme/db/motif_databases/
#1356682722
ls
#1356682748
vim ~/.bash_history 
#1356682771
ls /misc/PWBCAdminStore
#1356682807
ls /misc/PWBCAdminStore/app/galaxy/galaxy_dist/prod/
#1356682830
vim /misc/PWBCAdminStore/app/galaxy/galaxy_dist/dev/run_env.bashrc
#1356682844
cd /share/ClusterShare/software/centos6/meme_4.8.1/bin
#1356682845
ls
#1356682848
cd ..
#1356682848
ls
#1356682854
cd db/motif_databases
#1356682855
pwd
#1356682861
ls
#1356682877
cd
#1356682887
cd bin/meme/db/
#1356682888
ls
#1356682890
rm motif_databases/
#1356682895
rm -r motif_databases/
#1356682903
ln -s /share/ClusterShare/software/centos6/meme_4.8.1/db/motif_databases motif_databases
#1356682903
ls
#1356682905
ls motif_databases
#1356682920
ls /home/kevyin/bin/meme/db/motif_databases/JASPAR_PHYLOFACTS_2008.meme
#1356683445
ls /home/kevyin/bin/meme/db/motif_databases/JASPAR_CORE_2009.meme
#1356682210
cd pwbcglxdev
#1356682215
ssh pwbcglxdev
#1356682250
qstat
#1356682259
qstat -f -u "*"
#1356682273
ssh pwbcglxdev
#1356682376
cd /misc/PWBCAdminStore
#1356682389
cd app/galaxy/galaxy_dist/prod
#1356682390
ls
#1356682392
cd ..
#1356682394
ls
#1356682395
cd dev/
#1356682396
ls
#1356682415
cd tool-data/
#1356682415
ls
#1356682419
vim
#1356727925
ulimit -n
#1356727927
ulimit -Hn
#1356727916
qlogin 
#1356727982
qlogin -pe smp 42
#1356675123
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
#1356675124
ls
#1356675127
vim
#1356688643
module load kevyin/meme/4.9.0 
#1356688645
meme-chip
#1356688655
which meme
#1356688665
/share/ClusterShare/software/contrib/kevyin/meme_4.9.0/bin/
#1356688669
ls /share/ClusterShare/software/contrib/kevyin/meme_4.9.0/bin/
#1356688674
ls /share/ClusterShare/software/contrib/kevyin/meme_4.9.0/db/
#1356668921
ls
#1356668925
screen -ls
#1356668929
screen -r gatk
#1356669134
ls
#1356669140
cd /misc/FacilityBioinformatics/private/Illumina_HiSeq_2000_Runfolder/
#1356669141
ls
#1356669151
cd PG0002526-DNA_fastq/
#1356669152
ls
#1356669154
vim
#1356669177
ls
#1356669182
head PG0002526-DNA_1.fastq 
#1356669188
head PG0002526-DNA_2.fastq 
#1356751414
ssh pwbcglxdev
#1356751446
ssh glxdev
#1356750944
cd tmp
#1356750944
ls
#1356750949
touch files
#1356750953
sudo touch files2
#1356750957
ls
#1356750959
ll
#1356751176
cd /misc/PWBCAdminStore
#1356751183
cd app/galaxy/galaxy_dist/
#1356751183
ls
#1356751201
cd dev/
#1356751201
ls
#1356751219
vimm
#1356751224
vim
#1356751233
cd tool-data/
#1356751233
ls
#1356751240
vim meme_chip_motifs.loc
#1356751249
ll
#1356751259
sudo -u pwbcad meme_chip_motifs.loc
#1356751270
sudo -u vim pwbcad meme_chip_motifs.loc
#1356751279
sudo -u pwbcad vim meme_chip_motifs.loc
#1356751410
ssh nerv-geofront
#1356750869
ls
#1356750872
sudo touch tmp
#1356750876
ls
#1356750880
ll
#1356750885
cd tmp
#1356750886
ls
#1356750890
sudo touch file
#1356750891
ls
#1356750892
ll
#1356750900
ssh pwbcglxdev
#1356750916
ssh glxdev
#1356750924
ssh pwbcglxdev
#1356750938
ssh gamma02
#1356773338
ssh nerv-geofront
#1356773346
ssh pwbcglxdev
#1356773371
sudo service galaxy restart
#1356773756
source /misc/PWBCAdminStore/app/galaxy/galaxy_dist/dev/run_env.bashrc
#1356773761
which meme-chip
#1356821140
ls
#1356821146
ll
#1356821151
ls -l
#1356821158
cd Invalid/
#1356821158
ls
#1356821160
cd ..
#1356821162
rm Invalid/
#1356821166
rm -r Invalid/
#1356821173
rm -r limit\:/
#1356821175
ls line
#1356821180
rm -rf line
#1356821212
rm -r argument/ cannot/ modify/
#1356821214
ls
#1356821221
ls -l install/
#1356821227
ls open/
#1356821229
ls perl5/
#1356821235
rm -r install/ open/ 
#1356821236
ls
#1356821243
cd dev/
#1356821244
ls
#1356821258
mkdir scala
#1356821260
cd scala
#1356821261
ls
#1356821269
git init
#1356821273
ls
#1356821288
scala
#1356821342
cd /share/ClusterShare/software/contrib/kevyin/_tool_src/
#1356821342
ls
#1356821344
cd downloaded/
#1356821347
mkdir scala
#1356821351
cd scala/
#1356821357
wget 
#1356821366
wget http://www.scala-lang.org/downloads/distrib/files/scala-2.9.2.tgz
#1356821382
ls
#1356821387
tar -zxvf scala-2.9.2.tgz 
#1356821389
ls
#1356821390
cd scala-2.9.2
#1356821391
ls
#1356821395
ls bin/
#1356821400
ls doc/
#1356821403
vim
#1356821448
java -version
#1356821457
ls man
#1356821464
ls man/man1/
#1356821488
man grep
#1356821511
manpath
#1356821621
echo $MANPATH
#1356821647
export MANPATH=./man:$MANPATH
#1356821649
man scala
#1356821654
ls
#1356821657
ls lib/
#1356821665
vim
#1356821679
ls
#1356821687
cd ../../../..
#1356821691
cd ../../..
#1356821692
ls
#1356821701
cd Modules/modulefiles/contrib/kevyin/
#1356821707
cd /share/ClusterShare/software/contrib/kevyin/_tool_src/downloaded/scala/scala-2.9.2
#1356821708
ls
#1356821711
cd ..
#1356821711
ls
#1356821717
cd ../..
#1356821719
cd ..
#1356821719
ls
#1356821721
mkdir scala
#1356821723
cd scala/
#1356821724
ls
#1356821742
cp ../_tool_src/downloaded/scala/scala-2.9.2 2.9.2
#1356821746
cp -r ../_tool_src/downloaded/scala/scala-2.9.2 2.9.2
#1356821747
ls
#1356821750
cd 2.9.2/
#1356821751
ls
#1356821761
cd /share/ClusterShare/Modules/modulefiles/contrib/kevyin/
#1356821762
ls
#1356821766
mkdir scala
#1356821768
cd scala/
#1356821775
vim
#1356821930
which scala
#1356821939
module load kevyin/scala/2.9.2 
#1356821941
which scala
#1356821944
man scala
#1356821947
man man
#1356821949
man grep
#1356821981
cd
#1356821985
cd dev/scala/
#1356821985
ls
#1356822829
vim hello.scala
#1356838107
cd .ssh/
#1356838109
vim config n
#1356838113
vim config 
#1356838116
ls
#1356838118
ll
#1356838128
vim config 
#1356838133
exit
#1356838151
cat .ssh/config 
#1356838174
exit
#1356838298
cd /misc/FacilityBioinformatics/private/
#1356838301
cd kevyin/gitrepos/
#1356838301
ls
#1356838306
exit
#1356838184
which ssh
#1356838198
man ssh
#1356838224
ls
#1356838232
ls ~/.ssh/config
#1356838238
vim ~/.ssh/config
#1356838274
cd dev/
#1356838275
ls
#1356838277
cd scala/
#1356838277
ls
#1356838458
cd ..
#1356838466
git clone https://github.com/kevyin/mustached-bear.git
#1356838476
mv scala/ mustached-bear/
#1356838478
cd mustached-bear/
#1356838479
ls
#1356838482
git add scala
#1356838484
git status
#1356838491
git commit -m "first scala commit"
#1356838492
ls
#1356838496
cd scala
#1356838500
vim
#1356838513
cd dev/mustached-bear/scala/
#1356838513
ls
