<?php  
	@$dari = $_POST['dari'];
	@$sampai = $_POST['sampai'];
	@$kd_rombel = $_POST['rombel'];
?>
<form method="post">
	<div class="col-md-10">
		<div class="input-group">
			<div class="input-group-addon" id="pri">Dari Tanggal</div>
			<input type="date" name="dari" class="form-control" required value="<?php if(isset($_POST['dari'])){echo $dari; }else{ echo date("Y-m-d"); }?>">

			<div class="input-group-addon" id="pri">Sampai Tanggal</div>
			<input type="date" name="sampai" class="form-control" required value="<?php if(isset($_POST['sampai'])){echo $sampai; }else{ echo date("Y-m-d"); }?>"> 

			<div class="input-group-addon" id="pri">Rombel</div>

			<select name="rombel" class="form-control" required >
				<?php  
					$sql = mysql_query("SELECT * FROM tbl_rombel WHERE tahun_pelajaran = '$_SESSION[tp]' ORDER BY rombel ASC");
					while($rombel = mysql_fetch_array($sql)){?>
						<option value="<?php echo $rombel['rombel'] ?>" <?php if($rombel['rombel']==@$kd_rombel){echo "selected";} ?>><?php echo $rombel['rombel']; ?></option>
				<?php } ?>
			</select>
			<div class="input-group-btn">
				<input type="submit" name="tampil" class="btn btn-primary" value="Tampil">
			</div>
		</div>
	</div>
</form>
<br><br><br>	
<?php  
	if (isset($_POST['tampil'])) { 
			$link_print = "piket/kinerja/export/format_print_rombel.php?rombelP&rombel=".$kd_rombel."&dari=".$dari."&sampai=".$sampai;
			$link_pdf = "piket/kinerja/export/format_pdf.php?rombelP&rombel=".$kd_rombel."&dari=".$dari."&sampai=".$sampai;
			$link_excel = "piket/kinerja/export/format_excel.php?rombelP&rombel=".$kd_rombel."&dari=".$dari."&sampai=".$sampai;
		?>
		<div class="col-md-12">
			<div class="panel panel-default">
				<div class="panel-heading">Laporan Kinerja Siswa Rombel <?php echo $kd_rombel; ?> Periode <?php $aksi->format_tanggal($dari);echo " - ";$aksi->format_tanggal($sampai); ?></div>
				<div class="panel-body">
					<div class="col-md-12" style="margin-bottom:15px;">
						<div class="col-md-4 pull-right" >
							<div class="input-group">
								<div class="input-group-btn">
									<a href="<?php echo $link_print ?>" target="_blank" class="btn btn-success"><div class="glyphicon glyphicon-print"></div>&nbsp;Cetak</a>
									<a href="<?php echo $link_pdf; ?>" target="_blank" class="btn btn-success"><div class="glyphicon glyphicon-floppy-save"></div>&nbsp;Simpan PDF</a>
									<a href="<?php echo $link_excel; ?>" target="_blank" class="btn btn-success"><div class="glyphicon glyphicon-floppy-save"></div>&nbsp;Simpan Excel</a>
								</div>
							</div>
						</div>			
					</div>
					<table id="example1" class="table table-bordered table-hover table-striped">
		                <thead>
		                	<tr>
			                	<th width="10">No.</th>
		                		<th>Nis</th>
		                		<th>Nama</th>
		                		<th>JK</th>
		                		<th>Rayon</th>
		                		<th><center>Skor Reward</center></th>
		                		<th><center>Skor Punishment</center></th>
		                		<th><center>Cetak</center></th>
		                	</tr>
		                </thead>
		                 <tbody>
		                	<?php  
		                		$no =0;
		                		$table = "tbl_kinerja_siswa";
		                		$where = "WHERE rombel = '$kd_rombel' AND tgl_kejadian BETWEEN '$dari' AND '$sampai'";
		                		$sum = "nis,nama,rombel,kode_rayon,SUM(skor_r) as skor_reward, SUM(skor_p) as skor_punishment";
		                		$data = $aksi->tampil_sum($sum,$table,$where,"GROUP BY nis ORDER BY nis ASC");
		                		if (empty($data)) {?>
		                			<tr><td></td><td></td><td></td><td></td><td align="center">Data Tidak Ada</td><td></td><td></td><td></td></tr>
		                		<?php }else{
			                		foreach ($data as $r) {
		                			$no++;
		                			$siswa = $aksi->caridata("tbl_siswa WHERE nis = '$r[nis]'");
		                			$rayon = $aksi->caridata("tbl_rayon WHERE kode_rayon = '$r[kode_rayon]'");
			                		$link_detail = "piket/kinerja/export/format_print_detail.php?siswaP&nis=".$r['nis']."&dari=".$dari."&sampai=".$sampai;

		                		 ?>
		                		 	<tr>
				             			<td><?php echo $no; ?>.</td>
				             			<td><?php echo $r['nis']; ?></td>
				             			<td><?php echo $r['nama']; ?></td>
				             			<td>
				             				<?php 
				             					if ($siswa['jk']=="L") {
				             						echo "Laki-laki";
				             					}else{
				             						echo "Perempuan";
				             					}
				             				 ?>
				             			</td>
				             			<td><?php echo $rayon['rayon']; ?></td>
				             			<td align="center">
				             				<a href="#" data-toggle="modal" data-target="#<?php echo $r['nis'] ?>REWARD">
								           		<?php echo $r['skor_reward']; ?>
				             				</a>
				             				<div class="modal fade" id="<?php echo $r['nis'];?>REWARD">
				             					<div class="modal-dialog modal-lg modal-primary">
													<div class="modal-content">
														<div class="modal-header">
															<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
															<h4 class="modal-title">Daftar Riwayat Reward : <?php echo $r['nama']." Periode ";$aksi->format_tanggal($dari);echo " - ";$aksi->format_tanggal($sampai); ?></h4>
														</div>

															<table class="table table-bordered table-striped table-hover">
																<thead>
																	<tr>
													                    <th><center>No.</center></th>
													                    <th>Tanggal</th>
													                    <th>Nama Kinerja</th>
													                    <th>Saksi</th>
													                    <th><center>Skor</center></th>
													                </tr>
																</thead>
																<tbody>
																	<?php  
																		$no_detail_r = 0;
																		$where_detail_r = "WHERE nis = '$r[nis]' AND kelompok_kinerja = 'REWARD' AND tgl_kejadian BETWEEN '$dari' AND '$sampai'";
																		$details_r = $aksi->tampil($table,$where_detail_r,"ORDER BY tgl_kejadian ASC");
																		if (empty($details_r)) {
																			$aksi->no_record(5);
																		}else{
																			foreach ($details_r as $detail_r) {
																				$no_detail_r++;
																				$detail_kinerja_r = $aksi->caridata("tbl_poin_kinerja WHERE kode_kinerja = '$detail_r[kode_kinerja]'");
																			?>
																				<tr>
																					<td><center><?php echo $no_detail_r; ?>.</center></td>
																					<td><?php $aksi->format_tanggal($detail_r['tgl_kejadian']); ?></td>
																					<td><?php echo $detail_r['kode_kinerja']." | ".$detail_kinerja_r['nama_kinerja']; ?></td>
																					<td><?php echo $detail_r['saksi']; ?></td>
																					<td><center><?php echo $detail_r['skor_r']; ?></center></td>
																				</tr>

																	<?php } } ?>
																</tbody>
															</table>

														<div class="modal-footer">
															<button type="button" class="btn btn-default" data-dismiss="modal">Kembali</button>
														</div>
													</div>
												</div>
				             				</div>
				             			</td>
				             			<td align="center">
				             				<a href="#" data-toggle="modal" data-target="#<?php echo $r['nis'] ?>PUNISHMENT">
								           		<?php echo $r['skor_punishment']; ?>
				             				</a>
				             				<div class="modal fade" id="<?php echo $r['nis'];?>PUNISHMENT">
				             					<div class="modal-dialog modal-lg modal-primary">
													<div class="modal-content">
														<div class="modal-header">
															<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
															<h4 class="modal-title">Daftar Riwayat Punishment : <?php echo $r['nama']." Periode ";$aksi->format_tanggal($dari);echo " - ";$aksi->format_tanggal($sampai); ?></h4>
														</div>

															<table class="table table-bordered table-striped table-hover">
																<thead>
																	<tr>
													                    <th><center>No.</center></th>
													                    <th>Tanggal</th>
													                    <th>Nama Kinerja</th>
													                    <th>Saksi</th>
													                    <th><center>Skor</center></th>
													                </tr>
																</thead>
																<tbody>
																	<?php  
																		$no_detail_p = 0;
																		$where_detail_p = "WHERE nis = '$r[nis]' AND kelompok_kinerja = 'PUNISHMENT' AND tgl_kejadian BETWEEN '$dari' AND '$sampai'";
																		$details_p = $aksi->tampil($table,$where_detail_p,"ORDER BY tgl_kejadian ASC");
																		if (empty($details_p)) {
																			$aksi->no_record(5);
																		}else{
																			foreach ($details_p as $detail_p) {
																				$no_detail_p++;
																				$detail_kinerja_p = $aksi->caridata("tbl_poin_kinerja WHERE kode_kinerja = '$detail_p[kode_kinerja]'");
																			?>
																				<tr>
																					<td><center><?php echo $no_detail_p; ?>.</center></td>
																					<td><?php $aksi->format_tanggal($detail_p['tgl_kejadian']); ?></td>
																					<td><?php echo $detail_p['kode_kinerja']." | ".$detail_kinerja_p['nama_kinerja']; ?></td>
																					<td><?php echo $detail_p['saksi']; ?></td>
																					<td><center><?php echo $detail_p['skor_p']; ?></center></td>
																				</tr>
																	<?php } } ?>
																</tbody>
															</table>

														<div class="modal-footer">
															<button type="button" class="btn btn-default" data-dismiss="modal">Kembali</button>
														</div>
													</div>
												</div>
				             				</div>
				             			</td>
				             			<td align="center"><a href="<?php echo $link_detail; ?>" target="_blank">Detail</a></td>
				             		</tr>

	                		<?php  } }  ?>
		                </tbody>
		             </table>
				</div>
			</div>
		</div>
<?php } ?>