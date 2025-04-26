using Abp.Dependency;
using Abp.Threading.BackgroundWorkers;
using System;
using System.Threading;

namespace Kairos.EmailTriage.Services.EmailService.Jobs
{
    public class EmailBackgroundWorkerAdapter : BackgroundWorkerBase, ISingletonDependency
    {
        private readonly IIocResolver _iocResolver;
        private EmailBackgroundJob _backgroundJob;
        private CancellationTokenSource _cancellationTokenSource;

        public EmailBackgroundWorkerAdapter(IIocResolver iocResolver)
        {
            _iocResolver = iocResolver;
        }

        public override void Start()
        {
            base.Start();

            // Resolve the EmailBackgroundJob from ABP's container
            _backgroundJob = _iocResolver.Resolve<EmailBackgroundJob>();
            
            // Create a cancellation token source
            _cancellationTokenSource = new CancellationTokenSource();
            
            // Start the background service manually
            _backgroundJob.StartAsync(_cancellationTokenSource.Token).ConfigureAwait(false);
        }

        public override void WaitToStop()
        {
            if (_backgroundJob != null && _cancellationTokenSource != null)
            {
                // Signal cancellation and wait for the background service to stop
                _cancellationTokenSource.Cancel();
                _backgroundJob.StopAsync(_cancellationTokenSource.Token).Wait();
                
                // Release the resolved component
                _iocResolver.Release(_backgroundJob);
                
                // Dispose the cancellation token source
                _cancellationTokenSource.Dispose();
                _cancellationTokenSource = null;
            }
            
            base.WaitToStop();
        }
    }
}